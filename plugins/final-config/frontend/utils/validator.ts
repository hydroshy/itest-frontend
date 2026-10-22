/**
 * Format validation engine for Final Config registers
 */

export interface RegisterValidationResult {
  valid: boolean;
  error?: string;
}

export function validateRegisterConfig(
  input: string | number | null | undefined,
  format: string | null | undefined,
  numberOfRegisters: number
): RegisterValidationResult {
  const fmt = (format || '').trim().toLowerCase();
  const inputText = input !== null && input !== undefined ? String(input).trim() : '';
  // Hex represents bytes; users may paste values with spaces, which are normalized before validation.
  const rawStr = fmt === 'hex' ? inputText.replace(/\s+/g, '') : inputText;
  const numRegs = numberOfRegisters > 0 ? numberOfRegisters : 1;

  // If empty input:
  // String or hex can be empty, numeric types require a valid number
  if (!rawStr) {
    if (fmt === 'string' || fmt === 'ascii' || fmt === 'hex') {
      return { valid: true };
    }
    return { valid: false, error: 'Giá trị cấu hình không được để trống' };
  }

  switch (fmt) {
    case 'string':
    case 'ascii': {
      // 1 register = 2 ASCII bytes
      const maxChars = numRegs * 2;
      if (rawStr.length > maxChars) {
        return {
          valid: false,
          error: `Độ dài ký tự (${rawStr.length}) vượt quá giới hạn tối đa ${maxChars} ký tự (${numRegs} registers)`,
        };
      }
      return { valid: true };
    }

    case 'hex': {
      // Must be valid hex chars
      if (!/^[0-9a-fA-F]+$/.test(rawStr)) {
        return { valid: false, error: 'Giá trị phải là chuỗi Hex hợp lệ (0-9, A-F)' };
      }
      if (rawStr.length % 2 !== 0) {
        return { valid: false, error: 'Chuỗi Hex phải có số ký tự chẵn (mỗi byte gồm 2 ký tự)' };
      }
      // 1 register = 2 bytes = 4 hex characters
      const maxHexChars = numRegs * 4;
      if (rawStr.length > maxHexChars) {
        return {
          valid: false,
          error: `Độ dài Hex (${rawStr.length}) vượt quá giới hạn tối đa ${maxHexChars} ký tự (${numRegs} registers)`,
        };
      }
      return { valid: true };
    }

    case 'uint16': {
      if (!/^\d+$/.test(rawStr)) {
        return { valid: false, error: 'Phải là số nguyên không âm (uint16)' };
      }
      const val = Number(rawStr);
      if (val < 0 || val > 65535) {
        return { valid: false, error: 'Giá trị uint16 phải trong khoảng 0 - 65535' };
      }
      return { valid: true };
    }

    case 'int16': {
      if (!/^-?\d+$/.test(rawStr)) {
        return { valid: false, error: 'Phải là số nguyên có dấu (int16)' };
      }
      const val = Number(rawStr);
      if (val < -32768 || val > 32767) {
        return { valid: false, error: 'Giá trị int16 phải trong khoảng -32768 - 32767' };
      }
      return { valid: true };
    }

    case 'uint32': {
      if (!/^\d+$/.test(rawStr)) {
        return { valid: false, error: 'Phải là số nguyên không âm (uint32)' };
      }
      const val = Number(rawStr);
      if (val < 0 || val > 4294967295) {
        return { valid: false, error: 'Giá trị uint32 phải trong khoảng 0 - 4294967295' };
      }
      return { valid: true };
    }

    case 'int32': {
      if (!/^-?\d+$/.test(rawStr)) {
        return { valid: false, error: 'Phải là số nguyên có dấu (int32)' };
      }
      const val = Number(rawStr);
      if (val < -2147483648 || val > 2147483647) {
        return { valid: false, error: 'Giá trị int32 phải trong khoảng -2147483648 - 2147483647' };
      }
      return { valid: true };
    }

    case 'float32':
    case 'float': {
      const val = Number(rawStr);
      if (isNaN(val) || !/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(rawStr)) {
        return { valid: false, error: 'Phải là số thực hợp lệ (float32)' };
      }
      return { valid: true };
    }

    default: {
      // Fallback: if format unknown or bitfield/dec/boolean
      if (fmt.includes('hex')) {
        if (!/^[0-9a-fA-F]+$/.test(rawStr)) {
          return { valid: false, error: 'Phải là chuỗi Hex hợp lệ' };
        }
      }
      return { valid: true };
    }
  }
}
