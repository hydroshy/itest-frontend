/**
 * Modbus RTU Frame & Contiguous Chunking Utilities (FC 16)
 * Specifically crafted for Preconfiguration batch register writing.
 */

export interface PreconfigRegisterItem {
  address: number;
  count: number;
  values: number[]; // 16-bit word values
  description?: string;
  format?: string;
  rawInput?: string;
}

export interface ModbusChunk {
  startAddress: number;
  registerCount: number;
  byteCount: number;
  values: number[];
  items: PreconfigRegisterItem[];
  buildFrame: (slaveId: number) => Uint8Array;
}

/**
 * Convert string input to 16-bit words according to format and register count
 */
export function encodeValueToWords(input: string, format?: string, registerCount = 1): number[] {
  const fmt = (format || '').trim().toLowerCase();
  const raw = input.trim();
  const words: number[] = new Array(registerCount).fill(0);

  if (!raw) return words;

  try {
    if (fmt === 'hex') {
      const cleanHex = raw.replace(/\s+/g, '');
      for (let i = 0; i < registerCount; i++) {
        const byte1 = parseInt(cleanHex.substring(i * 4, i * 4 + 2) || '0', 16);
        const byte2 = parseInt(cleanHex.substring(i * 4 + 2, i * 4 + 4) || '0', 16);
        words[i] = ((byte1 & 0xff) << 8) | (byte2 & 0xff);
      }
    } else if (fmt === 'string' || fmt === 'ascii') {
      for (let i = 0; i < registerCount; i++) {
        const char1 = raw.charCodeAt(i * 2) || 0;
        const char2 = raw.charCodeAt(i * 2 + 1) || 0;
        words[i] = ((char1 & 0xff) << 8) | (char2 & 0xff);
      }
    } else if (fmt === 'uint16' || fmt === 'int16') {
      const num = parseInt(raw, 10);
      words[0] = num & 0xffff;
    } else if (fmt === 'uint32' || fmt === 'int32') {
      const num = parseInt(raw, 10);
      words[0] = (num >> 16) & 0xffff;
      words[1] = num & 0xffff;
    } else if (fmt === 'float' || fmt === 'float32') {
      const floatVal = parseFloat(raw);
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setFloat32(0, floatVal, false); // Big endian
      words[0] = view.getUint16(0, false);
      words[1] = view.getUint16(2, false);
    } else {
      // Default integer fallback
      const num = parseInt(raw, 10);
      if (!isNaN(num)) {
        words[0] = num & 0xffff;
      }
    }
  } catch (err) {
    console.warn(`[encodeValueToWords] Failed to encode "${input}" as ${format}:`, err);
  }

  return words;
}

/**
 * Calculate standard Modbus CRC-16 (polynomial 0xA001).
 * Returns [crcLo, crcHi]
 */
export function calculateModbusCrc16(buffer: Uint8Array | number[]): [number, number] {
  let crc = 0xffff;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  return [crc & 0xff, (crc >> 8) & 0xff];
}

/**
 * Group consecutive registers into contiguous chunks for Modbus FC 16 (0x10).
 * Prevents exceeding maxRegistersPerChunk (default: 32 words) to avoid buffer overflow on sensors.
 */
export function createContiguousChunks(
  registers: PreconfigRegisterItem[],
  maxRegistersPerChunk = 32,
): ModbusChunk[] {
  if (!registers || registers.length === 0) {
    return [];
  }

  // Sort registers ascending by address
  const sorted = [...registers].sort((a, b) => a.address - b.address);
  const chunks: ModbusChunk[] = [];

  let currentItems: PreconfigRegisterItem[] = [];
  let currentStart = sorted[0].address;
  let currentCount = 0;
  let currentValues: number[] = [];

  for (const reg of sorted) {
    const regCount = reg.count || reg.values.length || 1;
    const isContiguous = currentItems.length === 0 || reg.address === currentStart + currentCount;
    const fitsLimit = currentCount + regCount <= maxRegistersPerChunk;

    if (isContiguous && fitsLimit) {
      currentItems.push(reg);
      currentCount += regCount;
      currentValues.push(...reg.values);
    } else {
      if (currentItems.length > 0) {
        chunks.push(finalizeChunk(currentStart, currentCount, currentValues, currentItems));
      }
      currentStart = reg.address;
      currentCount = regCount;
      currentValues = [...reg.values];
      currentItems = [reg];
    }
  }

  if (currentItems.length > 0) {
    chunks.push(finalizeChunk(currentStart, currentCount, currentValues, currentItems));
  }

  return chunks;
}

function finalizeChunk(
  startAddress: number,
  registerCount: number,
  values: number[],
  items: PreconfigRegisterItem[],
): ModbusChunk {
  const byteCount = registerCount * 2;
  return {
    startAddress,
    registerCount,
    byteCount,
    values,
    items,
    buildFrame: (slaveId: number) => {
      // Frame: [SlaveId, 0x10, AddrHi, AddrLo, QtyHi, QtyLo, ByteCount, ...Data, CrcLo, CrcHi]
      const frameLen = 7 + byteCount + 2;
      const frame = new Uint8Array(frameLen);
      frame[0] = slaveId & 0xff;
      frame[1] = 0x10; // FC 16
      frame[2] = (startAddress >> 8) & 0xff;
      frame[3] = startAddress & 0xff;
      frame[4] = (registerCount >> 8) & 0xff;
      frame[5] = registerCount & 0xff;
      frame[6] = byteCount & 0xff;

      let offset = 7;
      for (const val of values) {
        frame[offset++] = (val >> 8) & 0xff;
        frame[offset++] = val & 0xff;
      }

      const [crcLo, crcHi] = calculateModbusCrc16(frame.subarray(0, 7 + byteCount));
      frame[offset++] = crcLo;
      frame[offset++] = crcHi;

      return frame;
    },
  };
}
