/**
 * Format validation engine for Preconfig registers
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
  const rawStr = fmt === 'hex' ? inputText.replace(/\s+/g, '') : inputText;
  const numRegs = numberOfRegisters > 0 ? numberOfRegisters : 1;

  if (!rawStr) {
    return { valid: true };
  }

  switch (fmt) {
    case 'string':
    case 'ascii': {
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
      if (!/^[0-9a-fA-F]+$/.test(rawStr)) {
        return { valid: false, error: 'Giá trị phải là chuỗi Hex hợp lệ (0-9, A-F)' };
      }
      if (rawStr.length % 2 !== 0) {
        return { valid: false, error: 'Chuỗi Hex phải có số ký tự chẵn (mỗi byte gồm 2 ký tự)' };
      }
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

    case 'float':
    case 'float32': {
      if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(rawStr)) {
        return { valid: false, error: 'Phải là số thực (float)' };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}
