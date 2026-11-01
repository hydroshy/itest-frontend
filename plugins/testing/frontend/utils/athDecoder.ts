/**
 * Modbus RTU & ATH Template Decoder Utility for Device Testing Wizard
 * Tham khảo template ATH_TEMPLATE.csv và logic đọc nhanh FC03
 */

export interface ATHRegistersResult {
  fwCode: string;
  fwVersion: string;
  hwVersion: string;
  meVersion: string;
  devEui: string;
  appEui: string;
  appKey: string;
  regionCode: string;
  deviceClass: string;
  sensorType: number;
  serialNumber: string;
  itemCode: string;
}

// CRC16 Modbus (Polynomial 0xA001)
export function calcModbusCRC16(buffer: number[] | Uint8Array): number {
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
  return crc & 0xffff;
}

// Build Modbus RTU FC03 Read Holding Registers request
export function buildModbusReadRequest(slave: number, startReg: number, countReg: number): Uint8Array {
  const req = new Uint8Array(8);
  req[0] = slave & 0xff;
  req[1] = 0x03; // FC 03
  req[2] = (startReg >> 8) & 0xff;
  req[3] = startReg & 0xff;
  req[4] = (countReg >> 8) & 0xff;
  req[5] = countReg & 0xff;
  const crc = calcModbusCRC16(req.subarray(0, 6));
  req[6] = crc & 0xff;
  req[7] = (crc >> 8) & 0xff;
  return req;
}

// Convert byte slice to printable ASCII string
export function bytesToString(bytes: number[] | Uint8Array): string {
  if (!bytes || !bytes.length) return '';
  return String.fromCharCode(
    ...Array.from(bytes).filter((b) => b >= 32 && b <= 126)
  ).trim();
}

// Convert byte slice to Upper Hex string
export function bytesToHex(bytes: number[] | Uint8Array): string {
  if (!bytes || !bytes.length) return '';
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

// Extract slice from register map where each register is 2 bytes (Big Endian)
export function sliceRegisters(
  regMap: Map<number, number>,
  startReg: number,
  count: number
): Uint8Array {
  const bytes = new Uint8Array(count * 2);
  for (let i = 0; i < count; i++) {
    const val = regMap.get(startReg + i) ?? 0;
    bytes[i * 2] = (val >> 8) & 0xff;
    bytes[i * 2 + 1] = val & 0xff;
  }
  return bytes;
}

/**
 * Decode register map to ATH parsed fields
 */
export function decodeATHRegisters(regMap: Map<number, number>): ATHRegistersResult {
  const fwCodeBytes = sliceRegisters(regMap, 0, 5);
  const fwVersionBytes = sliceRegisters(regMap, 5, 4);
  const hwVersionBytes = sliceRegisters(regMap, 9, 2);
  const meVersionBytes = sliceRegisters(regMap, 15, 2);
  const devEuiBytes = sliceRegisters(regMap, 27, 4);
  const appEuiBytes = sliceRegisters(regMap, 31, 4);
  const appKeyBytes = sliceRegisters(regMap, 35, 8);
  const regionCodeBytes = sliceRegisters(regMap, 69, 3);
  const classBytes = sliceRegisters(regMap, 85, 1);
  const sensorTypeVal = regMap.get(103) ?? 0;
  const serialBytes = sliceRegisters(regMap, 259, 9);
  const itemCodeBytes = sliceRegisters(regMap, 386, 14);

  return {
    fwCode: bytesToString(fwCodeBytes),
    fwVersion: bytesToString(fwVersionBytes),
    hwVersion: bytesToString(hwVersionBytes),
    meVersion: bytesToString(meVersionBytes),
    devEui: bytesToHex(devEuiBytes),
    appEui: bytesToHex(appEuiBytes),
    appKey: bytesToHex(appKeyBytes),
    regionCode: bytesToString(regionCodeBytes) || 'AS923-1',
    deviceClass: bytesToString(classBytes) || 'A',
    sensorType: sensorTypeVal,
    serialNumber: bytesToString(serialBytes),
    itemCode: bytesToString(itemCodeBytes),
  };
}
