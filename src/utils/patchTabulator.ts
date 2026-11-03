import { Module, TabulatorFull as Tabulator } from 'tabulator-tables';

let cellPatched = false;
let rowPatched = false;
let colPatched = false;

function patchCell(cell: any) {
  if (cellPatched) return;
  const proto = Object.getPrototypeOf(cell);
  if (!proto || proto.__safe_patched) return;

  const origGetWidth = proto.getWidth;
  proto.getWidth = function() {
    if (this.width) return this.width;
    if (this.element && typeof this.element.offsetWidth === 'number') {
      return this.element.offsetWidth;
    }
    const def = this.column?.definition;
    return parseInt(def?.width as any) || parseInt(def?.minWidth as any) || 0;
  };

  const origGetHeight = proto.getHeight;
  proto.getHeight = function() {
    if (this.height) return this.height;
    if (this.element && typeof this.element.offsetHeight === 'number') {
      return this.element.offsetHeight;
    }
    return 0;
  };

  proto.__safe_patched = true;
  cellPatched = true;
}

function patchRow(row: any) {
  if (rowPatched) return;
  const proto = Object.getPrototypeOf(row);
  if (!proto || proto.__safe_patched) return;

  proto.getWidth = function() {
    return (this.element && typeof this.element.offsetWidth === 'number') ? this.element.offsetWidth : 0;
  };

  const origCalcHeight = proto.calcHeight;
  proto.calcHeight = function(force?: boolean) {
    if (!this.element) {
      this.outerHeight = this.height || 0;
      return;
    }
    try {
      return origCalcHeight.call(this, force);
    } catch {
      this.outerHeight = this.height || 0;
    }
  };

  const origSetCellHeight = proto.setCellHeight;
  if (typeof origSetCellHeight === 'function') {
    proto.setCellHeight = function() {
      if (!this.element) {
        this.outerHeight = this.height || 0;
        return;
      }
      try {
        return origSetCellHeight.call(this);
      } catch {
        this.outerHeight = this.height || 0;
      }
    };
  }

  proto.__safe_patched = true;
  rowPatched = true;
}

function patchColumn(col: any) {
  if (colPatched) return;
  const proto = Object.getPrototypeOf(col);
  if (!proto || proto.__safe_patched) return;

  const origFitToData = proto.fitToData;
  proto.fitToData = function(force?: boolean) {
    if (!this.element) return;
    try {
      return origFitToData.call(this, force);
    } catch {
      return;
    }
  };

  proto.__safe_patched = true;
  colPatched = true;
}

class SafePatchModule extends Module {
  static moduleName = 'safePatchModule';

  initialize() {
    (this as any).subscribe('cell-init', (cell: any) => patchCell(cell));
    (this as any).subscribe('row-init', (row: any) => patchRow(row));
    (this as any).subscribe('column-init', (col: any) => patchColumn(col));
  }
}

let registered = false;

export function ensureTabulatorPatched(): void {
  if (registered) return;
  registered = true;

  try {
    Tabulator.registerModule(SafePatchModule);
  } catch (e) {
    console.warn('Tabulator registerModule error:', e);
  }
}
