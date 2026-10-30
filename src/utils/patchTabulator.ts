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

  if (typeof document === 'undefined') return;

  try {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:100px;height:100px;visibility:hidden;pointer-events:none;';
    document.body.appendChild(div);

    const dummy = new Tabulator(div, {
      data: [{ _id: 1 }],
      columns: [{ field: '_id', width: 50 }],
    });

    try {
      (dummy as any)._create();
    } catch {
      // _create might run or fail if styles uncomputed, SafePatchModule will still catch on normal table init
    }

    // Direct check if objects were created
    const col = (dummy as any).columnManager?.columns?.[0];
    const row = (dummy as any).rowManager?.rows?.[0];
    const cell = col?.cells?.[0] || row?.cells?.[0];

    if (col) patchColumn(col);
    if (row) patchRow(row);
    if (cell) patchCell(cell);

    try {
      dummy.destroy();
    } catch {
      // ignore
    }
    div.remove();
  } catch (e) {
    console.warn('Tabulator initial bootstrap patch attempt error:', e);
  }
}
