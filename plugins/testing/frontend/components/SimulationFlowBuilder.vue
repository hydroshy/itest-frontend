<template>
  <div class="simulation-flow-builder space-y-4">
    <!-- Flow Header Controls -->
    <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-sm tracking-wide">FUNCTION BLOCKS</span>
              <span class="badge badge-sm badge-primary font-mono font-bold">{{ blocks.length }} BLOCKS</span>
              <span class="badge badge-sm badge-outline font-mono">
                <Clock class="w-3 h-3 mr-1" />
                Tổng Thời Lượng: {{ totalDurationSeconds }}s ({{ (totalDurationSeconds / 60).toFixed(1) }} phút)
              </span>
              <span v-if="hasReferenceDevice" class="badge badge-sm badge-warning font-mono font-bold">
                CÓ THIẾT BỊ CHUẨN (REF)
              </span>
              <span v-if="hasMeasurementWindow" class="badge badge-sm badge-info font-mono font-bold">
                CÓ MEASUREMENT WINDOW
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- View Mode Toggle: Node Canvas (Node-Red) vs Classic Form List -->
          <div class="join bg-base-300 p-0.5 rounded-lg border border-base-content/10 mr-1">
            <button
              type="button"
              class="btn btn-xs join-item font-bold gap-1 transition-all"
              :class="viewMode === 'node-red' ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'"
              @click="viewMode = 'node-red'"
              title="Giao diện dạng khối nối Node-RED trực quan"
            >
              <span>🔗 Node Canvas</span>
            </button>
            <button
              type="button"
              class="btn btn-xs join-item font-bold gap-1 transition-all"
              :class="viewMode === 'classic' ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'"
              @click="viewMode = 'classic'"
              title="Giao diện danh sách tuần tự truyền thống"
            >
              <span>📋 Classic List</span>
            </button>
          </div>

          <button
            v-if="blocks.length > 0"
            type="button"
            class="btn btn-sm btn-ghost text-error"
            @click="clearAllBlocks"
            title="Xóa hết các blocks"
          >
            <Trash2 class="w-3.5 h-3.5 mr-1" />
            Xóa Hết
          </button>

          <button
            type="button"
            class="btn btn-sm btn-ghost gap-1 font-mono text-xs"
            @click="showJsonModal = true"
            title="Xem và chỉnh sửa cấu hình dạng JSON thô"
          >
            <Code class="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <!-- Add Function Block Dropdown / Quick Buttons -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" role="button" class="btn btn-sm btn-primary gap-1.5">
              <Plus class="w-4 h-4" />
              <span>Thêm Function Block</span>
            </label>
            <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300 text-xs space-y-1">
              <li class="menu-title text-[10px] uppercase font-bold text-primary">Điều Khiển &amp; Thời Gian</li>
              <li><a @click="addBlock('downlink')">📡 Downlink</a></li>
              <li><a @click="addBlock('clear_downlink')">🧹 Clear Downlink</a></li>
              <li><a @click="addBlock('delay')">⏱️ Delay</a></li>
              <li><a @click="addBlock('wait_until_offset')">🎯 Wait Until Offset</a></li>
              <li class="menu-title text-[10px] uppercase font-bold text-primary mt-1">Đo Lường &amp; Hiệu Chuẩn</li>
              <li><a @click="addBlock('start_measurement')">🟢 Start Measurement</a></li>
              <li><a @click="addBlock('stop_measurement')">🔴 Stop Measurement</a></li>
              <li><a @click="addBlock('average')">📊 Average</a></li>
              <li><a @click="addBlock('calculate_linear')">📐 Calculate Linear</a></li>
              <li><a @click="addBlock('convert_to_hex')">🔢 Convert to HEX</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="blocks.length === 0"
      class="card bg-base-200/50 border border-dashed border-base-content/20 rounded-box p-8 text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center mx-auto text-base-content/50">
        <Layers class="w-6 h-6" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-base-content">Chưa có Function Block nào</h4>
      </div>
      <div class="flex items-center justify-center pt-1">
        <div class="dropdown dropdown-top dropdown-center">
          <label tabindex="0" role="button" class="btn btn-sm btn-primary gap-1.5">
            <Plus class="w-4 h-4" />
            <span>Thêm Function Block</span>
          </label>
          <ul tabindex="0" class="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300 text-xs space-y-1">
            <li class="menu-title text-[10px] uppercase font-bold text-primary">Điều Khiển &amp; Thời Gian</li>
            <li><a @click="addBlock('downlink')">📡 Downlink</a></li>
            <li><a @click="addBlock('clear_downlink')">🧹 Clear Downlink</a></li>
            <li><a @click="addBlock('delay')">⏱️ Delay</a></li>
            <li><a @click="addBlock('wait_until_offset')">🎯 Wait Until Offset</a></li>
            <li class="menu-title text-[10px] uppercase font-bold text-primary mt-1">Đo Lường &amp; Hiệu Chuẩn</li>
            <li><a @click="addBlock('start_measurement')">🟢 Start Measurement</a></li>
            <li><a @click="addBlock('stop_measurement')">🔴 Stop Measurement</a></li>
            <li><a @click="addBlock('average')">📊 Average</a></li>
            <li><a @click="addBlock('calculate_linear')">📐 Calculate Linear</a></li>
            <li><a @click="addBlock('convert_to_hex')">🔢 Convert to HEX</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Node-RED Graph Canvas View -->
    <div
      v-if="viewMode === 'node-red' && blocks.length > 0"
      class="card bg-base-300/40 border border-base-content/10 rounded-2xl overflow-hidden shadow-inner flex flex-col min-h-[580px]"
    >
      <!-- Top Pipeline Quick-Navigator Bar -->
      <div class="bg-base-200/90 border-b border-base-content/10 px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto select-none">
        <div class="flex items-center gap-2 text-xs font-semibold shrink-0">
          <span class="text-base-content/60">Giai đoạn thực thi ({{ timelineSegments.filter(s => s.type === 'column').length }} Cột, {{ blocks.length }} bước):</span>
          <div class="flex items-center gap-1.5 flex-wrap">
            <template v-for="(seg, idx) in timelineSegments" :key="idx">
              <!-- Stage Column Tag -->
              <span
                v-if="seg.type === 'column'"
                class="badge badge-sm badge-outline font-mono font-bold text-primary border-primary/40 px-2 py-0.5 flex items-center gap-1"
              >
                <span>Cột {{ seg.stageIndex }}</span>
                <span class="badge badge-xs badge-primary text-[9px]">{{ seg.items.length }} func</span>
              </span>

              <!-- Delay Arrow Tag -->
              <span
                v-else-if="seg.type === 'delay'"
                class="badge badge-sm badge-warning font-mono font-bold text-[10px] cursor-pointer hover:scale-105 transition-transform"
                :class="selectedNodeIndex === seg.originalIndex ? 'ring-2 ring-warning' : ''"
                @click="selectNode(seg.originalIndex)"
              >
                ⏱️ {{ seg.delaySeconds }}s →
              </span>
            </template>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0 text-xs font-mono text-base-content/60">
          <span>Tổng: {{ (totalDurationSeconds / 60).toFixed(1) }} phút</span>
        </div>
      </div>

      <!-- Main Canvas Area: Interactive Node-Red Flow & Properties Drawer -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-[500px]">
        <!-- Node Palette Sidebar (Left) -->
        <div class="w-full lg:w-48 bg-base-200/50 border-b lg:border-b-0 lg:border-r border-base-content/10 p-3 flex flex-col gap-2 shrink-0 select-none">
          <div class="text-[10px] font-bold text-primary uppercase tracking-wider px-1">Node Palette</div>
          
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-1.5 overflow-y-auto max-h-[160px] lg:max-h-none">
            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium"
              @click="addBlock('downlink')"
            >
              <span>📡</span>
              <span class="truncate">Downlink</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-[11px] font-medium"
              @click="addBlock('delay')"
            >
              <span>⏱️</span>
              <span class="truncate">Delay</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-[11px] font-medium"
              @click="addBlock('wait_until_offset')"
            >
              <span>🎯</span>
              <span class="truncate">Wait Offset</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-medium"
              @click="addBlock('start_measurement')"
            >
              <span>🟢</span>
              <span class="truncate">Start Measure</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-[11px] font-medium"
              @click="addBlock('stop_measurement')"
            >
              <span>🔴</span>
              <span class="truncate">Stop Measure</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 text-[11px] font-medium"
              @click="addBlock('average')"
            >
              <span>📊</span>
              <span class="truncate">Average</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 text-[11px] font-medium"
              @click="addBlock('calculate_linear')"
            >
              <span>📐</span>
              <span class="truncate">Linear Math</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-[11px] font-medium"
              @click="addBlock('convert_to_hex')"
            >
              <span>🔢</span>
              <span class="truncate">Convert HEX</span>
            </button>

            <button
              type="button"
              class="btn btn-xs justify-start gap-1.5 rounded-lg border border-base-content/20 bg-base-100 text-base-content/80 hover:bg-base-200 text-[11px] font-medium"
              @click="addBlock('clear_downlink')"
            >
              <span>🧹</span>
              <span class="truncate">Clear Downlink</span>
            </button>
          </div>
        </div>

        <!-- Flow Visual Workspace: Multi-Column Concurrent Time-Slot Stage View -->
        <div class="flex-1 p-6 overflow-auto bg-[radial-gradient(#8882_1px,transparent_1px)] [background-size:16px_16px] relative select-none min-h-[380px]">
          <!-- Canvas Columns & Delay Transitions -->
          <div class="flex items-start gap-4 min-w-max py-2 px-1">
            <template v-for="(seg, segIdx) in timelineSegments" :key="segIdx">
              <!-- CASE 1: Stage Column (Các function thực thi cùng thời điểm) -->
              <div
                v-if="seg.type === 'column'"
                class="stage-column flex flex-col bg-base-200/60 border border-base-content/10 rounded-2xl p-3 w-[220px] shrink-0 shadow-sm transition-all"
              >
                <!-- Stage Header: Time Slot & Step Counter -->
                <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-base-content/10">
                  <div class="flex items-center gap-1.5">
                    <span class="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold font-mono text-xs flex items-center justify-center">
                      C{{ seg.stageIndex }}
                    </span>
                    <span class="text-xs font-bold text-base-content">Giai Đoạn {{ seg.stageIndex }}</span>
                  </div>
                  <span class="badge badge-xs font-mono font-bold text-[10px] badge-neutral">
                    {{ seg.timeLabel }}
                  </span>
                </div>

                <!-- Function Nodes in this Stage Column -->
                <div class="space-y-2.5">
                  <div
                    v-for="item in seg.items"
                    :key="item.block.id"
                    class="node-card relative group flex flex-col rounded-xl p-2.5 border shadow-xs transition-all duration-150 cursor-pointer"
                    :class="selectedNodeIndex === item.originalIndex
                      ? 'bg-base-100 border-primary ring-2 ring-primary/40 shadow-md -translate-y-0.5'
                      : 'bg-base-100/90 hover:bg-base-100 border-base-content/15 hover:border-primary/40'"
                    @click="selectNode(item.originalIndex)"
                  >
                    <!-- Node Header -->
                    <div class="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-base-content/10">
                      <div class="flex items-center gap-1 min-w-0">
                        <span class="text-[10px] font-mono font-bold text-base-content/50">#{{ item.originalIndex + 1 }}</span>
                        <span class="text-xs font-bold truncate text-base-content">
                          {{ getFunctionLabel(item.block.functionType) }}
                        </span>
                      </div>
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 text-error hover:bg-error/15 h-5 w-5 min-h-0"
                        @click.stop="removeBlock(item.originalIndex)"
                        title="Xóa node này"
                      >
                        ✕
                      </button>
                    </div>

                    <!-- Summary Parameter -->
                    <div class="text-[11px] font-mono text-base-content/75 leading-tight">
                      <div v-if="item.block.functionType === 'downlink'" class="truncate text-blue-600 dark:text-blue-400">
                        Port: {{ item.block.fPort || 1 }} | {{ item.block.payloadHex || 'EMPTY' }}
                      </div>
                      <div v-else-if="item.block.functionType === 'start_measurement'" class="truncate text-emerald-600 dark:text-emerald-400">
                        Win: {{ item.block.windowId || 'WIN_01' }}
                      </div>
                      <div v-else-if="item.block.functionType === 'stop_measurement'" class="truncate text-rose-600 dark:text-rose-400">
                        Stop: {{ item.block.windowId || 'WIN_01' }}
                      </div>
                      <div v-else-if="item.block.functionType === 'average'" class="truncate text-yellow-600 dark:text-yellow-400">
                        Avg → {{ item.block.outputVar || 'x' }}
                      </div>
                      <div v-else-if="item.block.functionType === 'calculate_linear'" class="truncate text-cyan-600 dark:text-cyan-400">
                        y = a*x + b
                      </div>
                      <div v-else-if="item.block.functionType === 'convert_to_hex'" class="truncate text-indigo-600 dark:text-indigo-400">
                        {{ item.block.sourceVar || 'a' }} → {{ item.block.dataType || 'HEX' }}
                      </div>
                      <div v-if="item.block.targetDevice" class="text-[10px] text-primary font-bold truncate">
                        🎯 {{ formatTargetDevice(item.block.targetDevice) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add Function Directly into this Column (Chèn tại thời điểm này) -->
                <div class="dropdown dropdown-top dropdown-end mt-3 pt-2 border-t border-dashed border-base-content/10">
                  <label
                    tabindex="0"
                    role="button"
                    class="btn btn-xs btn-outline btn-primary w-full border-dashed rounded-lg gap-1 font-semibold text-[11px]"
                  >
                    <span>+ Thêm tại cột này</span>
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[20] menu p-1.5 shadow-xl bg-base-100 rounded-xl w-52 border border-base-300 text-xs space-y-0.5">
                    <li class="menu-title text-[9px] uppercase font-bold text-primary px-2 py-1">Thêm vào giai đoạn này</li>
                    <li><a @click="addBlock('downlink', seg.items[seg.items.length - 1].originalIndex + 1)">📡 Downlink</a></li>
                    <li><a @click="addBlock('start_measurement', seg.items[seg.items.length - 1].originalIndex + 1)">🟢 Start Measure</a></li>
                    <li><a @click="addBlock('stop_measurement', seg.items[seg.items.length - 1].originalIndex + 1)">🔴 Stop Measure</a></li>
                    <li><a @click="addBlock('average', seg.items[seg.items.length - 1].originalIndex + 1)">📊 Average</a></li>
                    <li><a @click="addBlock('calculate_linear', seg.items[seg.items.length - 1].originalIndex + 1)">📐 Linear Math</a></li>
                    <li><a @click="addBlock('convert_to_hex', seg.items[seg.items.length - 1].originalIndex + 1)">🔢 Convert HEX</a></li>
                    <li><a @click="addBlock('clear_downlink', seg.items[seg.items.length - 1].originalIndex + 1)">🧹 Clear Downlink</a></li>
                  </ul>
                </div>
              </div>

              <!-- CASE 2: Delay Arrow Transition (Mũi tên Delay nối 2 cột) -->
              <div
                v-else-if="seg.type === 'delay'"
                class="delay-arrow-connector flex flex-col items-center justify-center shrink-0 self-center px-1 group cursor-pointer"
                @click="selectNode(seg.originalIndex)"
              >
                <!-- Delay Badge on Arrow -->
                <div
                  class="badge badge-sm font-mono font-bold py-2 px-2.5 rounded-lg border transition-all mb-1 gap-1"
                  :class="selectedNodeIndex === seg.originalIndex
                    ? 'badge-warning shadow-md ring-2 ring-warning/40 scale-105'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'"
                  title="Bấm để chỉnh thời gian delay"
                >
                  <span>⏱️</span>
                  <span>{{ seg.delaySeconds }}s</span>
                  <button
                    type="button"
                    class="opacity-0 group-hover:opacity-100 ml-1 text-error hover:font-black text-xs"
                    @click.stop="removeBlock(seg.originalIndex)"
                    title="Xóa delay này"
                  >
                    ✕
                  </button>
                </div>

                <!-- SVG Arrow Line -->
                <svg class="w-16 h-6 text-amber-500/70 group-hover:text-amber-500 transition-colors" viewBox="0 0 64 24" fill="none">
                  <path d="M0 12 H56" stroke="currentColor" stroke-width="2.5" stroke-dasharray="4 2" />
                  <polygon points="54,6 64,12 54,18" fill="currentColor" />
                </svg>

                <span class="text-[9px] font-mono text-base-content/40 tracking-tighter">
                  {{ (seg.delaySeconds / 60).toFixed(1) }}m
                </span>
              </div>
            </template>

            <!-- Nút thêm Cột Mới (Tạo Delay mới để tách sang cột tiếp theo) -->
            <div class="flex flex-col items-center justify-center self-center shrink-0 pl-2">
              <button
                type="button"
                class="btn btn-sm btn-circle btn-outline btn-warning border-dashed shadow-xs hover:scale-105"
                @click="addBlock('delay')"
                title="Thêm bước Delay để mở sang Cột thời điểm mới"
              >
                ⏱️+
              </button>
              <span class="text-[10px] font-semibold text-warning mt-1">Tạo Cột Mới</span>
            </div>
          </div>
        </div>

        <!-- Node Property Drawer Panel (Right Side Inspector) -->
        <div
          v-if="selectedNodeIndex !== null && blocks[selectedNodeIndex]"
          class="w-full lg:w-96 bg-base-100 border-t lg:border-t-0 lg:border-l border-base-content/10 p-4 flex flex-col gap-3 shrink-0 shadow-lg overflow-y-auto max-h-[500px]"
        >
          <div class="flex items-center justify-between pb-2 border-b border-base-content/10">
            <div class="flex items-center gap-2">
              <span class="badge badge-primary font-bold">#{{ selectedNodeIndex + 1 }}</span>
              <h4 class="font-bold text-sm text-base-content">
                {{ getFunctionLabel(blocks[selectedNodeIndex].functionType) }}
              </h4>
            </div>

            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="selectedNodeIndex === 0"
                @click="moveBlockUp(selectedNodeIndex)"
                title="Di chuyển sang trái / lên trước"
              >
                <ChevronUp class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="selectedNodeIndex === blocks.length - 1"
                @click="moveBlockDown(selectedNodeIndex)"
                title="Di chuyển sang phải / ra sau"
              >
                <ChevronDown class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                @click="duplicateBlock(selectedNodeIndex)"
                title="Nhân bản node"
              >
                <Copy class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square text-error"
                @click="removeBlock(selectedNodeIndex)"
                title="Xóa node"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Quick Configuration Fields for Selected Node -->
          <div class="space-y-3 text-xs">
            <!-- Target Device Selector -->
            <div v-if="hasDeviceTarget(blocks[selectedNodeIndex].functionType)">
              <div class="flex items-center justify-between py-1">
                <label class="text-xs font-semibold">Thiết Bị Đích (Target Device):</label>
                <span
                  v-if="blocks[selectedNodeIndex].targetDevice"
                  class="badge badge-xs badge-info font-mono font-semibold"
                >
                  {{ formatTargetDevice(blocks[selectedNodeIndex].targetDevice) }}
                </span>
              </div>
              <select
                :value="getTargetSelectValue(blocks[selectedNodeIndex].targetDevice)"
                class="select select-sm select-bordered w-full font-mono text-xs"
                @change="onTargetSelectChange(blocks[selectedNodeIndex], ($event.target as HTMLSelectElement).value)"
              >
                <optgroup label="Thiết Bị Cần Test (DUT)">
                  <option value="DUT">
                    🎯 {{ props.dutName && props.dutName !== 'DUT' ? `${props.dutName} (DUT)` : 'DUT (Thiết Bị Cần Test)' }}
                  </option>
                </optgroup>

                <optgroup v-if="availableRefDeviceNames.length > 0" label="Thiết Bị Tham Chiếu Đã Khai Báo (REF)">
                  <option
                    v-for="refName in availableRefDeviceNames"
                    :key="refName"
                    :value="refName"
                  >
                    ⭐ {{ refName }}
                  </option>
                </optgroup>
                <optgroup v-else label="Thiết Bị Tham Chiếu / Mô Phỏng">
                  <option value="REF">⭐ REF (Thiết Bị Chuẩn)</option>
                  <option value="SIMU">🤖 SIMU (Mô Phỏng Tự Do)</option>
                </optgroup>
              </select>
            </div>

            <!-- Downlink Parameters -->
            <template v-if="blocks[selectedNodeIndex].functionType === 'downlink'">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="label py-1 text-xs font-semibold">FPort:</label>
                  <input
                    v-model.number="blocks[selectedNodeIndex].fPort"
                    type="number"
                    min="1"
                    max="223"
                    class="input input-sm input-bordered w-full font-mono"
                    @input="emitUpdate"
                  />
                </div>
                <div>
                  <label class="label py-1 text-xs font-semibold">Loại Downlink:</label>
                  <select
                    v-model="blocks[selectedNodeIndex].confirmed"
                    class="select select-sm select-bordered w-full font-mono text-xs"
                    @change="emitUpdate"
                  >
                    <option :value="false">Unconfirmed (Mặc định)</option>
                    <option :value="true">Confirmed (Có ACK)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="label py-1 text-xs font-semibold">Payload HEX:</label>
                <input
                  v-model="blocks[selectedNodeIndex].payloadHex"
                  type="text"
                  placeholder="01 02 A3..."
                  class="input input-sm input-bordered w-full font-mono text-xs"
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- Delay Parameters -->
            <template v-else-if="blocks[selectedNodeIndex].functionType === 'delay'">
              <div>
                <label class="label py-1 text-xs font-semibold">Thời Gian Chờ (Giây):</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="blocks[selectedNodeIndex].delaySeconds"
                    type="number"
                    min="1"
                    class="input input-sm input-bordered flex-1 font-mono font-bold"
                    @input="emitUpdate"
                  />
                  <span class="text-base-content/60 font-mono text-xs">s</span>
                </div>
              </div>
            </template>

            <!-- Wait Until Offset -->
            <template v-else-if="blocks[selectedNodeIndex].functionType === 'wait_until_offset'">
              <div>
                <label class="label py-1 text-xs font-semibold">Mốc Thời Gian Offset (Giây):</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="blocks[selectedNodeIndex].offsetSeconds"
                    type="number"
                    min="1"
                    class="input input-sm input-bordered flex-1 font-mono font-bold"
                    @input="emitUpdate"
                  />
                  <span class="text-base-content/60 font-mono text-xs">s</span>
                </div>
              </div>
            </template>

            <!-- Measurement Window (Start/Stop) -->
            <template v-else-if="blocks[selectedNodeIndex].functionType === 'start_measurement' || blocks[selectedNodeIndex].functionType === 'stop_measurement'">
              <div>
                <label class="label py-1 text-xs font-semibold">Mã Cửa Sổ Đo (Window ID):</label>
                <input
                  v-model="blocks[selectedNodeIndex].windowId"
                  type="text"
                  placeholder="WINDOW_01"
                  class="input input-sm input-bordered w-full font-mono font-bold"
                  @input="emitUpdate"
                />
              </div>

              <div v-if="blocks[selectedNodeIndex].functionType === 'start_measurement'">
                <label class="label py-1 text-xs font-semibold">Trường Dữ Liệu Đo:</label>
                <input
                  v-model="blocks[selectedNodeIndex].metric"
                  type="text"
                  placeholder="gas_raw / rssi / snr"
                  class="input input-sm input-bordered w-full font-mono"
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- Average Block -->
            <template v-else-if="blocks[selectedNodeIndex].functionType === 'average'">
              <div>
                <label class="label py-1 text-xs font-semibold">Biến Đầu Ra (Output Var):</label>
                <input
                  v-model="blocks[selectedNodeIndex].outputVar"
                  type="text"
                  placeholder="x1"
                  class="input input-sm input-bordered w-full font-mono font-bold text-primary"
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- Description -->
            <div>
              <label class="label py-1 text-xs font-semibold">Ghi Chú Bước Này:</label>
              <input
                v-model="blocks[selectedNodeIndex].description"
                type="text"
                placeholder="Ghi chú bước thực thi..."
                class="input input-sm input-bordered w-full"
                @input="emitUpdate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sequential Block Chain (Classic Mode) -->
    <div v-else-if="viewMode === 'classic' && blocks.length > 0" class="space-y-3">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        class="relative transition-all"
        :class="{ 'opacity-50 ring-2 ring-primary ring-dashed rounded-box': draggedIndex === index }"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index, $event)"
      >
        <!-- Block Card -->
        <div class="card bg-base-200 border border-base-content/10 rounded-box shadow-sm p-4 hover:border-primary/40 transition-colors">
          <!-- Block Header -->
          <div
            class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10 gap-2 flex-wrap"
            draggable="true"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span class="cursor-grab active:cursor-grabbing p-1 -ml-1 text-base-content/40 hover:text-primary transition-colors" title="Kéo thả để di chuyển bước này">
                <GripVertical class="w-4 h-4" />
              </span>
              <span class="badge badge-sm font-mono font-bold bg-base-300">
                #{{ index + 1 }}
              </span>

              <span class="badge badge-sm font-bold uppercase tracking-wider" :class="getFunctionBadgeClass(block.functionType)">
                {{ getFunctionLabel(block.functionType) }}
              </span>

              <template v-if="block.targetDevice">
                <span v-if="block.targetDevice === 'DUT'" class="badge badge-sm badge-accent font-mono font-semibold">
                  🎯 DUT (Thiết Bị Cần Test)
                </span>
                <span v-else-if="block.targetDevice === 'REF'" class="badge badge-sm badge-warning font-mono font-semibold">
                  ⭐ REF (Thiết Bị Chuẩn)
                </span>
                <span v-else-if="block.targetDevice === 'SIMU'" class="badge badge-sm badge-info font-mono font-semibold">
                  🤖 SIMU (Thiết Bị Mô Phỏng)
                </span>
              </template>

              <span v-if="block.functionType === 'delay'" class="badge badge-sm badge-outline font-mono">
                ⏱️ Chờ {{ block.delaySeconds || 0 }}s
              </span>
              <span v-else-if="block.functionType === 'wait_until_offset'" class="badge badge-sm badge-outline font-mono">
                🎯 Mốc {{ block.offsetSeconds || 0 }}s
              </span>
              <span v-else-if="block.windowId" class="badge badge-sm badge-ghost font-mono text-[10px]">
                Window: {{ block.windowId }}<template v-if="block.metric"> ({{ block.metric }})</template>
              </span>
            </div>

            <!-- Block Header Actions -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="index === 0"
                @click="moveBlockUp(index)"
                title="Di chuyển lên trên"
              >
                <ChevronUp class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                :disabled="index === blocks.length - 1"
                @click="moveBlockDown(index)"
                title="Di chuyển xuống dưới"
              >
                <ChevronDown class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square"
                @click="duplicateBlock(index)"
                title="Nhân bản block"
              >
                <Copy class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-ghost btn-square text-error hover:bg-error/20"
                @click="removeBlock(index)"
                title="Xóa block này"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Block Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
            <!-- 1. Chọn Function Type -->
            <div class="form-control md:col-span-4">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Hàm Thực Thi (Function)</span>
              </label>
              <select
                v-model="block.functionType"
                class="select select-bordered select-sm w-full font-sans"
                @change="onFunctionTypeChanged(block)"
              >
                <optgroup label="Điều Khiển &amp; Thời Gian">
                  <option value="downlink">Downlink</option>
                  <option value="clear_downlink">Clear Downlink</option>
                  <option value="delay">Delay</option>
                  <option value="wait_until_offset">Wait Until Offset</option>
                </optgroup>
                <optgroup label="Đo Lường &amp; Hiệu Chuẩn">
                  <option value="start_measurement">Start Measurement</option>
                  <option value="stop_measurement">Stop Measurement</option>
                  <option value="average">Average</option>
                  <option value="calculate_linear">Calculate Linear</option>
                  <option value="convert_to_hex">Convert to HEX</option>
                </optgroup>
              </select>
            </div>

            <!-- 2. Thiết bị nhận lệnh: Lựa chọn theo tên thiết bị hoặc tùy chỉnh -->
            <div
              v-if="hasDeviceTarget(block.functionType)"
              class="form-control md:col-span-4"
            >
              <label class="label py-0.5 flex items-center justify-between">
                <span class="label-text text-xs font-semibold text-base-content/80">Tên Thiết Bị Nhận Lệnh</span>
                <span
                  v-if="block.targetDevice && block.targetDevice !== 'DUT'"
                  class="badge badge-xs badge-info font-mono font-semibold"
                >
                  {{ block.targetDevice }}
                </span>
              </label>
              <div class="space-y-1.5">
                <select
                  :value="getTargetSelectValue(block.targetDevice)"
                  class="select select-bordered select-sm w-full font-mono text-xs"
                  @change="(e) => onTargetSelectChange(block, (e.target as HTMLSelectElement).value)"
                >
                  <optgroup label="Thiết Bị Kiểm Tra (DUT)">
                    <option value="DUT">
                      🎯 {{ props.dutName && props.dutName !== 'DUT' ? `${props.dutName} (DUT)` : 'DUT (Thiết bị kiểm tra)' }}
                    </option>
                  </optgroup>

                  <optgroup v-if="availableRefDeviceNames.length > 0" label="Thiết Bị Tham Chiếu / Mô Phỏng (REF / SIMU)">
                    <option
                      v-for="refName in availableRefDeviceNames"
                      :key="refName"
                      :value="refName"
                    >
                      ⭐ {{ refName }}
                    </option>
                  </optgroup>
                  <optgroup v-else label="Thiết Bị Tham Chiếu / Mô Phỏng (REF / SIMU)">
                    <option value="REF">⭐ REF (Thiết bị tham chiếu)</option>
                    <option value="SIMU">🤖 SIMU (Thiết bị mô phỏng)</option>
                  </optgroup>

                  <optgroup label="Tùy Chọn Khác">
                    <option value="__CUSTOM__">✏️ Nhập tên thiết bị khác...</option>
                  </optgroup>
                </select>

                <!-- Input nhập text trực tiếp khi chọn Tùy Chọn Khác hoặc tên custom -->
                <div v-if="isCustomTarget(block.targetDevice)" class="join w-full">
                  <input
                    v-model="block.targetDevice"
                    type="text"
                    class="input input-bordered input-sm join-item w-full font-mono text-xs"
                    placeholder=""
                    @input="emitUpdate"
                  />
                  <button
                    type="button"
                    class="btn btn-sm btn-ghost join-item text-xs text-base-content/60"
                    title="Đặt lại về DUT"
                    @click="() => { block.targetDevice = 'DUT'; emitUpdate(); }"
                  >
                    DUT
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. Form fields riêng cho từng loại Block -->

            <!-- BLOCK: DELAY -->
            <div v-if="block.functionType === 'delay'" class="form-control md:col-span-8">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Thời Gian Chờ (Delay)</span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="block.delaySeconds"
                  type="number"
                  min="1"
                  step="1"
                  class="input input-bordered input-sm join-item w-full font-mono text-xs"
                  placeholder=""
                  @input="emitUpdate"
                />
                <span class="join-item btn btn-sm btn-neutral no-animation text-xs">giây</span>
              </div>
              <label class="label py-0.5">
                <span class="label-text-alt text-[10px] text-base-content/60">
                  Khoảng {{ ((block.delaySeconds || 0) / 60).toFixed(1) }} phút chờ ổn định.
                </span>
              </label>
            </div>

            <!-- BLOCK: WAIT_UNTIL_OFFSET -->
            <div v-if="block.functionType === 'wait_until_offset'" class="form-control md:col-span-8">
              <label class="label py-0.5">
                <span class="label-text text-xs font-semibold text-base-content/80">Mốc Thời Gian Offset (Từ Bắt Đầu Simulation)</span>
              </label>
              <div class="join w-full">
                <input
                  v-model.number="block.offsetSeconds"
                  type="number"
                  min="0"
                  step="1"
                  class="input input-bordered input-sm join-item w-full font-mono text-xs"
                  placeholder=""
                  @input="emitUpdate"
                />
                <span class="join-item btn btn-sm btn-neutral no-animation text-xs">giây</span>
              </div>
              <label class="label py-0.5">
                <span class="label-text-alt text-[10px] text-base-content/60">
                  Đợi cho đến phút thứ {{ ((block.offsetSeconds || 0) / 60).toFixed(1) }} tính từ lúc bắt đầu simulation, loại trừ sai lệch do thời gian xử lý step.
                </span>
              </label>
            </div>

            <!-- BLOCK: DOWNLINK -->
            <template v-if="block.functionType === 'downlink'">
              <div class="form-control md:col-span-2">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">FPort</span>
                </label>
                <input
                  v-model.number="block.fPort"
                  type="number"
                  min="1"
                  max="223"
                  class="input input-bordered input-sm w-full font-mono text-xs text-center"
                  placeholder=""
                  @input="emitUpdate"
                />
              </div>

              <div class="form-control md:col-span-2 flex items-center justify-center pt-5">
                <label class="label cursor-pointer gap-2">
                  <input
                    v-model="block.confirmed"
                    type="checkbox"
                    class="checkbox checkbox-xs checkbox-primary"
                    @change="emitUpdate"
                  />
                  <span class="label-text text-xs">Confirmed</span>
                </label>
              </div>

              <div class="form-control md:col-span-12">
                <div class="flex items-center justify-between py-0.5">
                  <label class="label-text text-xs font-semibold text-base-content/80 flex items-center gap-1.5">
                    <span>Downlink Payload (HEX hoặc Dynamic Variable)</span>
                    <span
                      v-if="block.payloadHex && !isDynamicPayload(block.payloadHex)"
                      class="badge badge-xs font-mono"
                      :class="getHexValidation(block.payloadHex).valid ? 'badge-success' : 'badge-error'"
                    >
                      {{ getHexValidation(block.payloadHex).bytes }} bytes
                    </span>
                    <span
                      v-else-if="block.payloadHex && isDynamicPayload(block.payloadHex)"
                      class="badge badge-xs badge-info font-mono"
                    >
                      DYNAMIC VARIABLE
                    </span>
                  </label>
                  <span class="text-[10px] text-base-content/50 font-mono">
                    Hỗ trợ Hex hoặc biến: <code class="text-primary">&#123;&#123;calib_payload_hex&#125;&#125;</code>, <code class="text-primary">&#123;&#123;a&#125;&#125; &#123;&#123;b&#125;&#125;</code>
                  </span>
                </div>
                <input
                  v-model="block.payloadHex"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder=""
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- BLOCK: START_MEASUREMENT -->
            <template v-if="block.functionType === 'start_measurement'">
              <div class="form-control md:col-span-4">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Mã Cửa Sổ (Window ID)</span>
                </label>
                <input
                  v-model="block.windowId"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs uppercase"
                  placeholder=""
                  @input="onMeasurementWindowInput(block)"
                />
              </div>
              <div class="form-control md:col-span-4">
                <label class="label py-0.5 flex items-center justify-between">
                  <span class="label-text text-xs font-semibold text-base-content/80">Trường FIELD_DATA</span>
                  <span v-if="getFieldDataOptions(block.targetDevice).length > 0" class="badge badge-xs badge-info font-mono text-[9px]">
                    {{ getFieldDataOptions(block.targetDevice).length }} fields
                  </span>
                </label>
                <div class="relative w-full">
                  <input
                    v-model="block.metric"
                    type="text"
                    :list="`field-options-${block.id}`"
                    class="input input-bordered input-sm w-full font-mono text-xs pr-7"
                    placeholder=""
                    @input="onMeasurementMetricChange(block)"
                  />
                  <datalist :id="`field-options-${block.id}`">
                    <option
                      v-for="f in getFieldDataOptions(block.targetDevice)"
                      :key="f.name"
                      :value="f.name"
                    >
                      {{ f.label }}
                    </option>
                  </datalist>
                </div>
              </div>
            </template>

            <!-- BLOCK: STOP_MEASUREMENT -->
            <template v-if="block.functionType === 'stop_measurement'">
              <div class="form-control md:col-span-8">
                <label class="label py-0.5 flex items-center justify-between">
                  <span class="label-text text-xs font-semibold text-base-content/80">Mã Cửa Sổ Cần Đóng (Window ID)</span>
                  <span v-if="availableMeasurementWindows.length > 0" class="badge badge-xs badge-info font-mono text-[9px]">
                    {{ availableMeasurementWindows.length }} cửa sổ mở
                  </span>
                </label>
                <div class="space-y-1">
                  <select
                    v-if="availableMeasurementWindows.length > 0"
                    :value="getAverageWindowSelectValue(block.windowId)"
                    class="select select-bordered select-sm w-full font-mono text-xs uppercase"
                    @change="(e) => { const v = (e.target as HTMLSelectElement).value; block.windowId = v === '__CUSTOM__' ? '' : v; emitUpdate(); }"
                  >
                    <option value="" disabled>-- Chọn Cửa Sổ Cần Đóng --</option>
                    <option
                      v-for="win in availableMeasurementWindows"
                      :key="win.windowId"
                      :value="win.windowId"
                    >
                      🪟 {{ win.windowId }} ({{ win.targetDevice }} · {{ win.metric || 'Đo lường' }})
                    </option>
                    <option value="__CUSTOM__">✏️ Nhập Window ID khác...</option>
                  </select>
                  <input
                    v-if="availableMeasurementWindows.length === 0 || isCustomAverageWindow(block.windowId)"
                    v-model="block.windowId"
                    type="text"
                    class="input input-bordered input-sm w-full font-mono text-xs uppercase"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>
              </div>
            </template>

            <!-- BLOCK: AVERAGE -->
            <template v-if="block.functionType === 'average'">
              <div class="form-control md:col-span-3">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Chế Độ Tính Average</span>
                </label>
                <select
                  v-model="block.averageMode"
                  class="select select-bordered select-sm w-full font-sans text-xs"
                  @change="emitUpdate"
                >
                  <option value="MEASUREMENT_WINDOW">MEASUREMENT_WINDOW (Theo Window ID)</option>
                  <option value="SAMPLE_COUNT">SAMPLE_COUNT (Theo N mẫu)</option>
                  <option value="TIME_WINDOW">TIME_WINDOW (Theo khoảng giây)</option>
                </select>
              </div>

              <!-- Mode: MEASUREMENT_WINDOW -> Chọn Window ID & tự động lấy FIELD_DATA -->
              <template v-if="block.averageMode === 'MEASUREMENT_WINDOW'">
                <div class="form-control md:col-span-3">
                  <label class="label py-0.5 flex items-center justify-between">
                    <span class="label-text text-xs font-semibold text-base-content/80">Cửa Sổ Đo Lường (Window ID)</span>
                    <span v-if="availableMeasurementWindows.length > 0" class="badge badge-xs badge-info font-mono text-[9px]">
                      {{ availableMeasurementWindows.length }} cửa sổ
                    </span>
                    <span v-else class="badge badge-xs badge-warning text-[9px]">Chưa tạo cửa sổ</span>
                  </label>
                  <div class="space-y-1">
                    <select
                      v-if="availableMeasurementWindows.length > 0"
                      :value="getAverageWindowSelectValue(block.windowId)"
                      class="select select-bordered select-sm w-full font-mono text-xs uppercase"
                      @change="(e) => onSelectAverageWindow(block, (e.target as HTMLSelectElement).value)"
                    >
                      <option value="" disabled>-- Chọn Cửa Sổ Đo Lường --</option>
                      <option
                        v-for="win in availableMeasurementWindows"
                        :key="win.windowId"
                        :value="win.windowId"
                      >
                        🪟 {{ win.windowId }} ({{ win.targetDevice }} · {{ win.metric || 'Chưa gắn FIELD_DATA' }})
                      </option>
                      <option value="__CUSTOM__">✏️ Nhập Window ID khác...</option>
                    </select>
                    <div v-if="availableMeasurementWindows.length === 0 || isCustomAverageWindow(block.windowId)" class="join w-full">
                      <input
                        v-model="block.windowId"
                        type="text"
                        class="input input-bordered input-sm join-item w-full font-mono text-xs uppercase"
                        placeholder=""
                        @input="onAverageWindowInput(block)"
                      />
                      <button
                        v-if="availableMeasurementWindows.length > 0"
                        type="button"
                        class="btn btn-sm btn-ghost join-item text-xs"
                        title="Quay lại danh sách chọn"
                        @click="onSelectAverageWindow(block, availableMeasurementWindows[0]?.windowId || '')"
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-control md:col-span-3">
                  <label class="label py-0.5 flex items-center justify-between">
                    <span class="label-text text-xs font-semibold text-base-content/80">Trường FIELD_DATA</span>
                    <span
                      v-if="getLinkedWindow(block.windowId)?.metric && block.metric === getLinkedWindow(block.windowId)?.metric"
                      class="badge badge-xs badge-success font-mono text-[9px]"
                      title="FIELD_DATA đã liên kết chính xác từ Cửa Sổ Đo Lường"
                    >
                      ✓ Từ {{ block.windowId }}
                    </span>
                    <button
                      v-else-if="getLinkedWindow(block.windowId)?.metric"
                      type="button"
                      class="badge badge-xs badge-warning font-mono text-[9px] cursor-pointer hover:opacity-80"
                      title="Nhấn để tự động điền FIELD_DATA từ Cửa Sổ Đo Lường này"
                      @click="() => { block.metric = getLinkedWindow(block.windowId)?.metric || ''; emitUpdate(); }"
                    >
                      ↺ Lấy {{ getLinkedWindow(block.windowId)?.metric }}
                    </button>
                    <span v-else-if="getFieldDataOptions(block.targetDevice).length > 0" class="badge badge-xs badge-info font-mono text-[9px]">
                      {{ getFieldDataOptions(block.targetDevice).length }} fields
                    </span>
                  </label>
                  <div class="relative w-full">
                    <input
                      v-model="block.metric"
                      type="text"
                      :list="`field-options-${block.id}`"
                      class="input input-bordered input-sm w-full font-mono text-xs pr-7"
                      placeholder=""
                      @input="emitUpdate"
                    />
                    <datalist :id="`field-options-${block.id}`">
                      <option
                        v-for="f in getFieldDataOptions(block.targetDevice)"
                        :key="f.name"
                        :value="f.name"
                      >
                        {{ f.label }}
                      </option>
                    </datalist>
                  </div>
                </div>
              </template>

              <!-- Mode: SAMPLE_COUNT -->
              <template v-else-if="block.averageMode === 'SAMPLE_COUNT'">
                <div class="form-control md:col-span-3">
                  <label class="label py-0.5">
                    <span class="label-text text-xs font-semibold text-base-content/80">Số Mẫu (N)</span>
                  </label>
                  <input
                    v-model.number="block.sampleCount"
                    type="number"
                    min="1"
                    class="input input-bordered input-sm w-full font-mono text-xs"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>

                <div class="form-control md:col-span-3">
                  <label class="label py-0.5 flex items-center justify-between">
                    <span class="label-text text-xs font-semibold text-base-content/80">Trường FIELD_DATA</span>
                    <span v-if="getFieldDataOptions(block.targetDevice).length > 0" class="badge badge-xs badge-info font-mono text-[9px]">
                      {{ getFieldDataOptions(block.targetDevice).length }} fields
                    </span>
                  </label>
                  <div class="relative w-full">
                    <input
                      v-model="block.metric"
                      type="text"
                      :list="`field-options-${block.id}`"
                      class="input input-bordered input-sm w-full font-mono text-xs pr-7"
                      placeholder=""
                      @input="emitUpdate"
                    />
                    <datalist :id="`field-options-${block.id}`">
                      <option
                        v-for="f in getFieldDataOptions(block.targetDevice)"
                        :key="f.name"
                        :value="f.name"
                      >
                        {{ f.label }}
                      </option>
                    </datalist>
                  </div>
                </div>
              </template>

              <!-- Mode: TIME_WINDOW -->
              <template v-else>
                <div class="form-control md:col-span-3">
                  <label class="label py-0.5">
                    <span class="label-text text-xs font-semibold text-base-content/80">Khoảng Giây (Duration)</span>
                  </label>
                  <input
                    v-model.number="block.delaySeconds"
                    type="number"
                    min="1"
                    class="input input-bordered input-sm w-full font-mono text-xs"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>

                <div class="form-control md:col-span-3">
                  <label class="label py-0.5 flex items-center justify-between">
                    <span class="label-text text-xs font-semibold text-base-content/80">Trường FIELD_DATA</span>
                    <span v-if="getFieldDataOptions(block.targetDevice).length > 0" class="badge badge-xs badge-info font-mono text-[9px]">
                      {{ getFieldDataOptions(block.targetDevice).length }} fields
                    </span>
                  </label>
                  <div class="relative w-full">
                    <input
                      v-model="block.metric"
                      type="text"
                      :list="`field-options-${block.id}`"
                      class="input input-bordered input-sm w-full font-mono text-xs pr-7"
                      placeholder=""
                      @input="emitUpdate"
                    />
                    <datalist :id="`field-options-${block.id}`">
                      <option
                        v-for="f in getFieldDataOptions(block.targetDevice)"
                        :key="f.name"
                        :value="f.name"
                      >
                        {{ f.label }}
                      </option>
                    </datalist>
                  </div>
                </div>
              </template>

              <!-- Biến Lưu Kết Quả Output -->
              <div class="form-control md:col-span-3">
                <label class="label py-0.5 flex items-center justify-between">
                  <span class="label-text text-xs font-semibold text-base-content/80">Lưu Vào Biến Output</span>
                  <span class="badge badge-xs badge-ghost text-[9px] font-mono">Dùng cho Linear</span>
                </label>
                <input
                  v-model="block.outputVar"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs text-primary font-bold"
                  placeholder=""
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- BLOCK: CALCULATE_LINEAR -->
            <template v-if="block.functionType === 'calculate_linear'">
              <div class="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-2 p-2.5 bg-base-100 rounded-lg border border-base-300">
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 1 - Raw x1 (DUT/Biến)</span>
                  </label>
                  <input
                    v-model="block.point1X"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 1 - Chuẩn y1 (ppm)</span>
                  </label>
                  <input
                    v-model.number="block.point1Y"
                    type="number"
                    step="any"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 2 - Raw x2 (DUT/Biến)</span>
                  </label>
                  <input
                    v-model="block.point2X"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Điểm 2 - Chuẩn y2 (ppm)</span>
                  </label>
                  <input
                    v-model.number="block.point2Y"
                    type="number"
                    step="any"
                    class="input input-bordered input-xs font-mono text-xs"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control col-span-2">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Biến Output Hệ Số a (Slope)</span>
                  </label>
                  <input
                    v-model="block.coeffAVar"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs text-primary font-bold"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>
                <div class="form-control col-span-2">
                  <label class="label py-0.5">
                    <span class="label-text text-[11px] font-semibold">Biến Output Hệ Số b (Offset)</span>
                  </label>
                  <input
                    v-model="block.coeffBVar"
                    type="text"
                    class="input input-bordered input-xs font-mono text-xs text-secondary font-bold"
                    placeholder=""
                    @input="emitUpdate"
                  />
                </div>
              </div>
            </template>

            <!-- BLOCK: CONVERT_TO_HEX -->
            <template v-if="block.functionType === 'convert_to_hex'">
              <div class="form-control md:col-span-4">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Biến Nguồn Đầu Vào</span>
                </label>
                <input
                  v-model="block.sourceVar"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder="Ví dụ: a hoặc {{a}}"
                  @input="emitUpdate"
                />
              </div>

              <div class="form-control md:col-span-4">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Định Dạng Mã Hóa (Data Type)</span>
                </label>
                <select
                  v-model="block.dataType"
                  class="select select-bordered select-sm w-full font-mono text-xs"
                  @change="emitUpdate"
                >
                  <option value="float32_be">Float32 Big Endian (IEEE-754)</option>
                  <option value="float32_le">Float32 Little Endian (IEEE-754)</option>
                  <option value="int16_be">Int16 Big Endian (2 bytes)</option>
                  <option value="int16_le">Int16 Little Endian (2 bytes)</option>
                  <option value="uint16_be">UInt16 Big Endian (2 bytes)</option>
                  <option value="uint16_le">UInt16 Little Endian (2 bytes)</option>
                  <option value="int32_be">Int32 Big Endian (4 bytes)</option>
                  <option value="int32_le">Int32 Little Endian (4 bytes)</option>
                  <option value="uint32_be">UInt32 Big Endian (4 bytes)</option>
                  <option value="uint32_le">UInt32 Little Endian (4 bytes)</option>
                </select>
              </div>

              <div class="form-control md:col-span-4">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Nguồn Traceability (Optional)</span>
                </label>
                <input
                  v-model="block.sourceBlock"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs"
                  placeholder="Ví dụ: Block #1"
                  @input="emitUpdate"
                />
              </div>

              <div class="form-control md:col-span-4">
                <label class="label py-0.5">
                  <span class="label-text text-xs font-semibold text-base-content/80">Lưu Vào Biến HEX Output</span>
                </label>
                <input
                  v-model="block.outputVar"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono text-xs text-primary font-bold"
                  placeholder="Ví dụ: x"
                  @input="emitUpdate"
                />
              </div>
            </template>

            <!-- Description / Ghi chú chung cho block -->
            <div class="form-control md:col-span-12">
              <label class="label py-0.5">
                <span class="label-text text-[11px] text-base-content/60">Ghi Chú Bước</span>
              </label>
              <input
                v-model="block.description"
                type="text"
                class="input input-bordered input-xs w-full text-xs"
                placeholder=""
                @input="emitUpdate"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Nút Thêm Function Block luôn nằm ở dưới function block cuối cùng -->
      <div class="flex items-center justify-center pt-2 pb-2">
        <div class="dropdown dropdown-top dropdown-center">
          <label tabindex="0" role="button" class="btn btn-sm btn-primary gap-1.5 shadow-md">
            <Plus class="w-4 h-4" />
            <span>Thêm Function Block</span>
          </label>
          <ul tabindex="0" class="dropdown-content z-[20] menu p-2 shadow-xl bg-base-100 rounded-box w-64 border border-base-300 text-xs space-y-1 mb-2">
            <li class="menu-title text-[10px] uppercase font-bold text-primary">Điều Khiển &amp; Thời Gian</li>
            <li><a @click="addBlock('downlink')">📡 Downlink</a></li>
            <li><a @click="addBlock('clear_downlink')">🧹 Clear Downlink</a></li>
            <li><a @click="addBlock('delay')">⏱️ Delay</a></li>
            <li><a @click="addBlock('wait_until_offset')">🎯 Wait Until Offset</a></li>
            <li class="menu-title text-[10px] uppercase font-bold text-primary mt-1">Đo Lường &amp; Hiệu Chuẩn</li>
            <li><a @click="addBlock('start_measurement')">🟢 Start Measurement</a></li>
            <li><a @click="addBlock('stop_measurement')">🔴 Stop Measurement</a></li>
            <li><a @click="addBlock('average')">📊 Average</a></li>
            <li><a @click="addBlock('calculate_linear')">📐 Calculate Linear</a></li>
            <li><a @click="addBlock('convert_to_hex')">🔢 Convert to HEX</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- JSON Preview / Import Modal -->
    <dialog class="modal" :class="{ 'modal-open': showJsonModal }">
      <div class="modal-box max-w-2xl bg-base-100 border border-base-content/10 shadow-xl">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
          <h3 class="font-bold text-sm flex items-center gap-2">
            <Code class="w-4 h-4 text-primary" />
            Cấu Hình JSON Function Blocks
          </h3>
          <button
            type="button"
            class="btn btn-sm btn-ghost btn-circle"
            @click="showJsonModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3">
          <p class="text-xs text-base-content/70">
            Bạn có thể sao chép hoặc dán JSON các function blocks chuẩn để cấu hình nhanh:
          </p>

          <textarea
            v-model="rawJsonInput"
            class="textarea textarea-bordered font-mono text-xs w-full h-64 bg-base-200"
            placeholder=""
          ></textarea>
        </div>

        <div class="modal-action flex items-center justify-between pt-2">
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            @click="copyJsonToClipboard"
          >
            <Copy class="w-3.5 h-3.5 mr-1" />
            Sao Chép JSON
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-ghost"
              @click="showJsonModal = false"
            >
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="applyJsonInput"
            >
              Áp Dụng JSON
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="showJsonModal = false">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Clock,
  Code,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-vue-next';
import { cyberToast } from '@/services/cyberToast';
import { httpClient } from '@/api/client';

export interface FlowBlock {
  id: string;
  functionType:
    | 'downlink'
    | 'clear_downlink'
    | 'delay'
    | 'wait_until_offset'
    | 'start_measurement'
    | 'stop_measurement'
    | 'average'
    | 'calculate_linear'
    | 'convert_to_hex'
    | string;
  targetDevice?: string;
  delaySeconds?: number;
  offsetSeconds?: number;
  windowId?: string;
  counterField?: string;
  metric?: string;
  averageMode?: 'SAMPLE_COUNT' | 'TIME_WINDOW' | 'MEASUREMENT_WINDOW';
  sampleCount?: number;
  outputVar?: string;
  sourceVar?: string;
  dataType?: string;
  sourceBlock?: string;
  point1X?: string | number;
  point1Y?: string | number;
  point2X?: string | number;
  point2Y?: string | number;
  coeffAVar?: string;
  coeffBVar?: string;
  payloadHex?: string;
  fPort?: number;
  confirmed?: boolean;
  description?: string;
}

export interface SimulationDeviceItem {
  id?: string;
  devEui: string;
  name?: string;
  deviceName?: string;
  itemCode?: string;
  status?: string;
  label?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: FlowBlock[];
    devices?: SimulationDeviceItem[];
    referenceDevices?: string[] | Array<{ name?: string; reference_name?: string; fields?: any[] }>;
    dutName?: string;
    dutFields?: Array<{ name: string; label?: string; unit?: string }>;
  }>(),
  {
    modelValue: () => [],
    devices: () => [],
    referenceDevices: () => [],
    dutName: 'DUT',
    dutFields: () => [],
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: FlowBlock[]): void;
}>();

const blocks = ref<FlowBlock[]>([]);
const viewMode = ref<'node-red' | 'classic'>('node-red');
const selectedNodeIndex = ref<number | null>(0);

interface StageItem {
  type: 'column';
  stageIndex: number;
  timeLabel: string;
  items: Array<{ block: FlowBlock; originalIndex: number }>;
}

interface DelayTransition {
  type: 'delay';
  block: FlowBlock;
  originalIndex: number;
  delaySeconds: number;
}

type TimelineSegment = StageItem | DelayTransition;

/**
 * Phân chia toàn bộ luồng FlowBlock tuần tự thành các Cột thời điểm (Stage Columns),
 * các function cùng một thời điểm được gom chung vào 1 cột đứng.
 * Chỉ chuyển sang Cột mới khi gặp khối Delay hoặc Wait Until Offset.
 */
const timelineSegments = computed<TimelineSegment[]>(() => {
  const segments: TimelineSegment[] = [];
  let currentStageBlocks: Array<{ block: FlowBlock; originalIndex: number }> = [];
  let currentStageIndex = 1;
  let accumulatedTime = 0;

  function pushCurrentStage() {
    if (currentStageBlocks.length > 0) {
      segments.push({
        type: 'column',
        stageIndex: currentStageIndex++,
        timeLabel: `T + ${accumulatedTime}s`,
        items: [...currentStageBlocks],
      });
      currentStageBlocks = [];
    }
  }

  blocks.value.forEach((block, index) => {
    if (block.functionType === 'delay') {
      pushCurrentStage();
      const dur = block.delaySeconds || 0;
      accumulatedTime += dur;
      segments.push({
        type: 'delay',
        block,
        originalIndex: index,
        delaySeconds: dur,
      });
    } else if (block.functionType === 'wait_until_offset') {
      pushCurrentStage();
      const targetOffset = block.offsetSeconds || accumulatedTime;
      const waitDur = Math.max(0, targetOffset - accumulatedTime);
      accumulatedTime = targetOffset;
      segments.push({
        type: 'delay',
        block,
        originalIndex: index,
        delaySeconds: waitDur,
      });
    } else {
      currentStageBlocks.push({ block, originalIndex: index });
    }
  });

  pushCurrentStage();
  return segments;
});

function selectNode(index: number) {
  selectedNodeIndex.value = index;
}
const showJsonModal = ref(false);
const rawJsonInput = ref('');
const draggedIndex = ref<number | null>(null);

function onDragStart(index: number, event: DragEvent) {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function onDrop(dropIndex: number, event: DragEvent) {
  event.preventDefault();
  const sourceIndex = draggedIndex.value ?? Number(event.dataTransfer?.getData('text/plain'));
  if (sourceIndex !== null && sourceIndex !== dropIndex && !isNaN(sourceIndex)) {
    const item = blocks.value.splice(sourceIndex, 1)[0];
    blocks.value.splice(dropIndex, 0, item);
    selectedNodeIndex.value = dropIndex;
    emitUpdate();
    cyberToast.info(`Đã di chuyển block #${sourceIndex + 1} tới vị trí #${dropIndex + 1}`);
  }
  draggedIndex.value = null;
}

function onDragEnd() {
  draggedIndex.value = null;
}

function getFieldDataOptions(targetDevice?: string): Array<{ name: string; label: string }> {
  const target = (targetDevice || 'DUT').trim().toUpperCase();
  let baseFields: Array<{ name: string; label: string }> = [];

  if (target === 'DUT' || target === props.dutName?.toUpperCase()) {
    baseFields = (props.dutFields || []).map((f) => ({
      name: f.name,
      label: f.label ? `${f.name} (${f.label})` : f.name,
    }));
  } else {
    // Check reference devices
    const foundRef = (props.referenceDevices || []).find((r: any) => {
      if (typeof r === 'string') return r.toUpperCase() === target || target === 'REF';
      const rName = (r.reference_name || r.name || '').trim().toUpperCase();
      return rName === target || target === 'REF' || target === 'SIMU';
    });
    if (foundRef && typeof foundRef === 'object' && Array.isArray((foundRef as any).fields)) {
      baseFields = (foundRef as any).fields.map((f: any) => ({
        name: f.name,
        label: f.label ? `${f.name} (${f.label})` : f.name,
      }));
    }
  }

  // Standard RF/network telemetry fields always available
  const standardMetrics = [
    { name: 'rssi', label: 'rssi (Chất lượng sóng RSSI dBm)' },
    { name: 'snr', label: 'snr (Tỷ số tín hiệu / nhiễu SNR dB)' },
    { name: 'fcnt', label: 'fcnt (Frame Counter / Bộ đếm gói)' },
  ];

  const merged = [...baseFields];
  standardMetrics.forEach((sm) => {
    if (!merged.some((m) => m.name.toLowerCase() === sm.name.toLowerCase())) {
      merged.push(sm);
    }
  });

  return merged;
}

// Auto-fetch simulation devices if props.devices is empty
const internalSimDevices = ref<SimulationDeviceItem[]>([]);

onMounted(async () => {
  if (!props.devices || props.devices.length === 0) {
    try {
      const res: any = await httpClient.get('/plugins/testing/simulation/devices').catch(() => null);
      const items = res?.data?.items || res?.data || res?.items || [];
      if (Array.isArray(items)) {
        internalSimDevices.value = items
          .map((d: any) => ({
            id: d.id,
            devEui: d.devEui || d.dev_eui || d.network_id || '',
            name: d.name || d.device_name || d.deviceName || '',
            itemCode: d.itemCode || d.item_code || '',
            status: d.status || '',
          }))
          .filter((d: any) => Boolean(d.name || d.devEui));
      }
    } catch {
      // ignore
    }
  }
});

const mergedSimDevices = computed<SimulationDeviceItem[]>(() => {
  const list = props.devices && props.devices.length > 0 ? props.devices : internalSimDevices.value;
  const seen = new Set<string>();
  const out: SimulationDeviceItem[] = [];
  list.forEach((s) => {
    const sName = (s.name || s.deviceName || s.label || s.devEui || '').trim();
    if (sName && !seen.has(sName)) {
      seen.add(sName);
      out.push(s);
    }
  });
  return out;
});

const availableRefDeviceNames = computed<string[]>(() => {
  const result: string[] = [];
  if (Array.isArray(props.referenceDevices)) {
    props.referenceDevices.forEach((item) => {
      const name = typeof item === 'string' ? item : (item.reference_name || item.name || '');
      const trimmed = name.trim();
      if (trimmed && !result.includes(trimmed)) {
        result.push(trimmed);
      }
    });
  }
  return result;
});

function formatTargetDevice(target?: string): string {
  if (!target) return 'DUT';
  const t = target.trim();
  if (t === 'DUT' || t === props.dutName) {
    return props.dutName && props.dutName !== 'DUT' ? props.dutName : 'DUT';
  }
  if (t === 'REF') {
    if (availableRefDeviceNames.value.length > 0) {
      return availableRefDeviceNames.value[0];
    }
    return 'Thiết Bị Chuẩn (REF)';
  }
  if (t === 'SIMU') {
    return 'Thiết Bị Mô Phỏng (SIMU)';
  }
  // Nếu target khớp với một tên trong danh sách tham chiếu
  const found = availableRefDeviceNames.value.find((name) => name.toLowerCase() === t.toLowerCase());
  if (found) return found;
  return t;
}

function getTargetSelectValue(target?: string): string {
  const t = (target || 'DUT').trim();
  if (t === 'DUT' || t === props.dutName) return 'DUT';
  if (t === 'REF') return 'REF';
  if (t === 'SIMU') return 'SIMU';
  if (availableRefDeviceNames.value.includes(t)) return t;
  if (mergedSimDevices.value.some((s) => (s.name || s.deviceName || s.label || s.devEui) === t)) return t;
  return '__CUSTOM__';
}

function isCustomTarget(target?: string): boolean {
  return getTargetSelectValue(target) === '__CUSTOM__';
}

function onTargetSelectChange(block: FlowBlock, selectedValue: string) {
  if (selectedValue === '__CUSTOM__') {
    if (['DUT', 'REF', 'SIMU'].includes(block.targetDevice || '')) {
      block.targetDevice = '';
    }
  } else {
    block.targetDevice = selectedValue;
  }
  if (block.functionType === 'start_measurement') {
    const opts = getFieldDataOptions(block.targetDevice);
    if (!block.metric && opts.length > 0) {
      block.metric = opts[0].name;
    }
    onMeasurementMetricChange(block);
  } else {
    emitUpdate();
  }
}

export interface MeasurementWindowOption {
  windowId: string;
  metric?: string;
  targetDevice: string;
  counterField?: string;
  stepIndex: number;
}

const availableMeasurementWindows = computed<MeasurementWindowOption[]>(() => {
  const result: MeasurementWindowOption[] = [];
  const seen = new Set<string>();
  blocks.value.forEach((b, idx) => {
    if (b.functionType === 'start_measurement' && b.windowId && b.windowId.trim()) {
      const wId = b.windowId.trim();
      const upper = wId.toUpperCase();
      if (!seen.has(upper)) {
        seen.add(upper);
        result.push({
          windowId: wId,
          metric: b.metric || '',
          targetDevice: b.targetDevice || 'DUT',
          counterField: b.counterField || 'fcnt',
          stepIndex: idx + 1,
        });
      }
    }
  });
  return result;
});

function getLinkedWindow(windowId?: string): MeasurementWindowOption | undefined {
  if (!windowId) return undefined;
  const clean = windowId.trim().toUpperCase();
  return availableMeasurementWindows.value.find((w) => w.windowId.toUpperCase() === clean);
}

function isCustomAverageWindow(windowId?: string): boolean {
  if (!windowId) return false;
  const clean = windowId.trim().toUpperCase();
  return !availableMeasurementWindows.value.some((w) => w.windowId.toUpperCase() === clean);
}

function getAverageWindowSelectValue(windowId?: string): string {
  if (!windowId) return '';
  const clean = windowId.trim().toUpperCase();
  const matched = availableMeasurementWindows.value.find((w) => w.windowId.toUpperCase() === clean);
  return matched ? matched.windowId : '__CUSTOM__';
}

function onSelectAverageWindow(block: FlowBlock, selectedWinId: string) {
  if (selectedWinId === '__CUSTOM__') {
    block.windowId = '';
    emitUpdate();
    return;
  }
  block.windowId = selectedWinId;
  const win = getLinkedWindow(selectedWinId);
  if (win) {
    if (win.metric) {
      block.metric = win.metric;
    }
    if (win.targetDevice) {
      block.targetDevice = win.targetDevice;
    }
    cyberToast.success(`Đã lấy Cửa Sổ '${win.windowId}' với FIELD_DATA '${win.metric || 'fcnt'}' (${win.targetDevice})`);
  }
  emitUpdate();
}

function onAverageWindowInput(block: FlowBlock) {
  const win = getLinkedWindow(block.windowId);
  if (win && win.metric && (!block.metric || block.metric === 'gas_raw')) {
    block.metric = win.metric;
    if (win.targetDevice) {
      block.targetDevice = win.targetDevice;
    }
  }
  emitUpdate();
}

function onMeasurementWindowInput(block: FlowBlock) {
  emitUpdate();
}

function onMeasurementMetricChange(block: FlowBlock) {
  if (block.windowId && block.metric) {
    blocks.value.forEach((b) => {
      if (
        b.functionType === 'average' &&
        b.averageMode === 'MEASUREMENT_WINDOW' &&
        b.windowId?.trim().toUpperCase() === block.windowId?.trim().toUpperCase()
      ) {
        b.metric = block.metric;
        if (block.targetDevice) b.targetDevice = block.targetDevice;
      }
    });
  }
  emitUpdate();
}

// Sync with modelValue prop and normalize legacy blocks
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(blocks.value)) {
      const raw = Array.isArray(newVal) ? newVal : [];
      blocks.value = raw.map((b) => normalizeBlock(b));
    }
  },
  { immediate: true, deep: true }
);

function normalizeBlock(b: any): FlowBlock {
  let fnType = b.functionType || b.type || 'downlink';
  if (fnType === 'downlink_hex') fnType = 'downlink';
  if (fnType === 'delay_wait') fnType = 'delay';

  const rawTarget = (b.targetDevice || b.target || b.targetDeviceName || 'DUT').toString().trim();
  const normalizedTarget = rawTarget || 'DUT';

  return {
    id: b.id || `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    functionType: fnType,
    targetDevice: hasDeviceTarget(fnType) ? normalizedTarget : undefined,
    delaySeconds: fnType === 'delay' ? (Number(b.delaySeconds) || 30) : undefined,
    offsetSeconds: fnType === 'wait_until_offset' ? (Number(b.offsetSeconds) || 0) : undefined,
    windowId: b.windowId || b.window_id || '',
    counterField: b.counterField || b.counter_field || (fnType === 'start_measurement' ? 'fcnt' : ''),
    metric: b.metric || b.field_data || b.fieldData || '',
    averageMode: b.averageMode || b.average_mode || 'MEASUREMENT_WINDOW',
    sampleCount: Number(b.sampleCount || b.sample_count) || undefined,
    outputVar: b.outputVar || b.output_var || '',
    point1X: b.point1X ?? b.point1_x ?? '',
    point1Y: b.point1Y ?? b.point1_y ?? 0,
    point2X: b.point2X ?? b.point2_x ?? '',
    point2Y: b.point2Y ?? b.point2_y ?? 20,
    coeffAVar: b.coeffAVar || b.coeff_a_var || 'a',
    coeffBVar: b.coeffBVar || b.coeff_b_var || 'b',
    sourceVar: b.sourceVar || b.source_var || '',
    dataType: b.dataType || b.data_type || (fnType === 'convert_to_hex' ? 'float32_be' : undefined),
    payloadHex: fnType === 'downlink' ? (b.payloadHex || b.payload || '') : '',
    fPort: fnType === 'downlink' ? (Number(b.fPort || b.fport) || 1) : undefined,
    confirmed: Boolean(b.confirmed || b.isConfirmed),
    description: b.description || '',
  };
}

function hasDeviceTarget(type: string): boolean {
  return ['downlink', 'clear_downlink', 'start_measurement', 'stop_measurement', 'average'].includes(type);
}

function isDynamicPayload(str: string): boolean {
  return typeof str === 'string' && str.includes('{{') && str.includes('}}');
}

function emitUpdate() {
  emit('update:modelValue', JSON.parse(JSON.stringify(blocks.value)));
}

// Compute total duration of flow (sum of delay blocks or maximum offset)
const totalDurationSeconds = computed(() => {
  let delaySum = 0;
  let maxOffset = 0;
  for (const b of blocks.value) {
    if (b.functionType === 'delay') {
      delaySum += Number(b.delaySeconds) || 0;
    } else if (b.functionType === 'wait_until_offset') {
      const off = Number(b.offsetSeconds) || 0;
      if (off > maxOffset) maxOffset = off;
    }
  }
  return Math.max(delaySum, maxOffset);
});

// Check if flow involves reference device
const hasReferenceDevice = computed(() => {
  return blocks.value.some((b) => {
    const t = (b.targetDevice || '').toUpperCase();
    return t === 'REF' || availableRefDeviceNames.value.some((r) => r.toUpperCase() === t);
  });
});

// Check if flow involves measurement window
const hasMeasurementWindow = computed(() => {
  return blocks.value.some((b) => b.functionType === 'start_measurement' || b.functionType === 'average');
});

// Hex validation helper
function getHexValidation(hexStr: string): { valid: boolean; bytes: number } {
  if (!hexStr) return { valid: false, bytes: 0 };
  if (isDynamicPayload(hexStr)) return { valid: true, bytes: 0 };
  const clean = hexStr.replace(/\s+/g, '');
  if (!clean) return { valid: false, bytes: 0 };
  const isHex = /^[0-9A-Fa-f]+$/.test(clean);
  const isEven = clean.length % 2 === 0;
  return {
    valid: isHex && isEven,
    bytes: isEven ? clean.length / 2 : Math.floor(clean.length / 2),
  };
}

function onFunctionTypeChanged(block: FlowBlock) {
  if (block.functionType === 'delay') {
    block.delaySeconds = block.delaySeconds || 30;
    block.targetDevice = undefined;
  } else if (block.functionType === 'wait_until_offset') {
    block.offsetSeconds = block.offsetSeconds || 120;
    block.targetDevice = undefined;
  } else if (block.functionType === 'start_measurement') {
    block.targetDevice = block.targetDevice || 'DUT';
    block.windowId = block.windowId || `WINDOW_0${availableMeasurementWindows.value.length + 1}`;
    block.counterField = block.counterField || 'fcnt';
    const opts = getFieldDataOptions(block.targetDevice);
    block.metric = block.metric || opts[0]?.name || 'gas_raw';
  } else if (block.functionType === 'stop_measurement') {
    block.targetDevice = block.targetDevice || 'DUT';
    const lastWin = availableMeasurementWindows.value[availableMeasurementWindows.value.length - 1];
    block.windowId = block.windowId || lastWin?.windowId || 'WINDOW_01';
  } else if (block.functionType === 'average') {
    block.averageMode = block.averageMode || 'MEASUREMENT_WINDOW';
    const lastWin = availableMeasurementWindows.value[availableMeasurementWindows.value.length - 1];
    if (lastWin) {
      block.windowId = lastWin.windowId;
      block.targetDevice = lastWin.targetDevice || 'DUT';
      block.metric = lastWin.metric || 'gas_raw';
      cyberToast.info(`Hàm Average: Tự động nhận Cửa Sổ '${lastWin.windowId}' với FIELD_DATA '${block.metric}'`);
    } else {
      block.targetDevice = block.targetDevice || 'DUT';
      block.windowId = block.windowId || 'WINDOW_01';
      block.metric = block.metric || 'gas_raw';
    }
    block.outputVar = block.outputVar || `x${blocks.value.filter((b) => b.functionType === 'average').length + 1}`;
  } else if (block.functionType === 'calculate_linear') {
    block.targetDevice = undefined;
    block.point1X = block.point1X || '{{x1}}';
    block.point1Y = block.point1Y ?? 0;
    block.point2X = block.point2X || '{{x2}}';
    block.point2Y = block.point2Y ?? 20;
    block.coeffAVar = block.coeffAVar || 'a';
    block.coeffBVar = block.coeffBVar || 'b';
  } else if (block.functionType === 'convert_to_hex') {
    block.targetDevice = undefined;
    block.sourceVar = block.sourceVar || 'a';
    block.dataType = block.dataType || 'float32_be';
    block.outputVar = block.outputVar || 'x';
  } else if (block.functionType === 'downlink') {
    block.targetDevice = block.targetDevice || 'DUT';
    block.fPort = block.fPort || 1;
  } else if (block.functionType === 'clear_downlink') {
    block.targetDevice = block.targetDevice || 'DUT';
  }
  emitUpdate();
}

function getFunctionBadgeClass(type: string) {
  switch (type) {
    case 'downlink':
      return 'badge-primary text-primary-content';
    case 'clear_downlink':
      return 'badge-secondary text-secondary-content';
    case 'delay':
      return 'badge-accent text-accent-content';
    case 'wait_until_offset':
      return 'badge-neutral text-neutral-content';
    case 'start_measurement':
      return 'badge-success text-success-content';
    case 'stop_measurement':
      return 'badge-error text-error-content';
    case 'average':
      return 'badge-warning text-warning-content';
    case 'calculate_linear':
      return 'badge-info text-info-content';
    case 'convert_to_hex':
      return 'badge-accent text-accent-content';
    default:
      return 'badge-neutral';
  }
}

function getFunctionLabel(type: string) {
  switch (type) {
    case 'downlink':
      return 'DOWNLINK';
    case 'clear_downlink':
      return 'CLEAR DOWNLINK';
    case 'delay':
      return 'DELAY';
    case 'wait_until_offset':
      return 'WAIT UNTIL OFFSET';
    case 'start_measurement':
      return 'START MEASUREMENT';
    case 'stop_measurement':
      return 'STOP MEASUREMENT';
    case 'average':
      return 'AVERAGE';
    case 'calculate_linear':
      return 'CALCULATE LINEAR';
    case 'convert_to_hex':
      return 'CONVERT TO HEX';
    default:
      return 'FUNCTION';
  }
}

// Block Actions
function addBlock(type: string, insertAtIndex?: number) {
  const lastWin = availableMeasurementWindows.value[availableMeasurementWindows.value.length - 1];
  const newBlock: FlowBlock = {
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    functionType: type,
    targetDevice: type === 'average' && lastWin ? (lastWin.targetDevice || 'DUT') : (hasDeviceTarget(type) ? 'DUT' : undefined),
    delaySeconds: type === 'delay' ? 30 : undefined,
    offsetSeconds: type === 'wait_until_offset' ? 120 : undefined,
    windowId: type === 'average'
      ? (lastWin?.windowId || 'WINDOW_01')
      : (type === 'start_measurement'
        ? `WINDOW_0${availableMeasurementWindows.value.length + 1}`
        : (type === 'stop_measurement' ? (lastWin?.windowId || 'WINDOW_01') : undefined)),
    counterField: type === 'start_measurement' ? (getFieldDataOptions('DUT')[0]?.name || 'fcnt') : undefined,
    metric: type === 'start_measurement'
      ? (getFieldDataOptions('DUT')[0]?.name || 'gas_raw')
      : (type === 'average' ? (lastWin?.metric || 'gas_raw') : undefined),
    averageMode: type === 'average' ? 'MEASUREMENT_WINDOW' : undefined,
    outputVar: type === 'average' ? `x${blocks.value.filter((b) => b.functionType === 'average').length + 1}` : (type === 'convert_to_hex' ? 'x' : undefined),
    sourceVar: type === 'convert_to_hex' ? 'a' : undefined,
    dataType: type === 'convert_to_hex' ? 'float32_be' : undefined,
    point1X: type === 'calculate_linear' ? '{{x1}}' : undefined,
    point1Y: type === 'calculate_linear' ? 0 : undefined,
    point2X: type === 'calculate_linear' ? '{{x2}}' : undefined,
    point2Y: type === 'calculate_linear' ? 20 : undefined,
    coeffAVar: type === 'calculate_linear' ? 'a' : undefined,
    coeffBVar: type === 'calculate_linear' ? 'b' : undefined,
    payloadHex: type === 'downlink' ? '01 02' : '',
    fPort: type === 'downlink' ? 1 : undefined,
    confirmed: false,
    description: '',
  };

  if (typeof insertAtIndex === 'number' && insertAtIndex >= 0 && insertAtIndex <= blocks.value.length) {
    blocks.value.splice(insertAtIndex, 0, newBlock);
    selectedNodeIndex.value = insertAtIndex;
  } else {
    blocks.value.push(newBlock);
    selectedNodeIndex.value = blocks.value.length - 1;
  }
  emitUpdate();
}

function removeBlock(index: number) {
  blocks.value.splice(index, 1);
  if (selectedNodeIndex.value !== null) {
    if (blocks.value.length === 0) {
      selectedNodeIndex.value = null;
    } else if (selectedNodeIndex.value >= blocks.value.length) {
      selectedNodeIndex.value = blocks.value.length - 1;
    }
  }
  emitUpdate();
}

function duplicateBlock(index: number) {
  const source = blocks.value[index];
  const clone: FlowBlock = {
    ...JSON.parse(JSON.stringify(source)),
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description: source.description ? `${source.description} (Bản sao)` : '',
  };
  blocks.value.splice(index + 1, 0, clone);
  emitUpdate();
  cyberToast.info('Đã nhân bản block thành công');
}

function moveBlockUp(index: number) {
  if (index <= 0) return;
  const item = blocks.value.splice(index, 1)[0];
  blocks.value.splice(index - 1, 0, item);
  if (selectedNodeIndex.value === index) {
    selectedNodeIndex.value = index - 1;
  }
  emitUpdate();
}

function moveBlockDown(index: number) {
  if (index >= blocks.value.length - 1) return;
  const item = blocks.value.splice(index, 1)[0];
  blocks.value.splice(index + 1, 0, item);
  if (selectedNodeIndex.value === index) {
    selectedNodeIndex.value = index + 1;
  }
  emitUpdate();
}

function clearAllBlocks() {
  blocks.value = [];
  emitUpdate();
  cyberToast.info('Đã xóa toàn bộ function blocks');
}

// JSON Modal helpers
watch(showJsonModal, (open) => {
  if (open) {
    rawJsonInput.value = JSON.stringify(blocks.value, null, 2);
  }
});

function copyJsonToClipboard() {
  navigator.clipboard.writeText(rawJsonInput.value);
  cyberToast.success('Đã sao chép JSON vào bộ nhớ đệm');
}

function applyJsonInput() {
  try {
    const parsed = JSON.parse(rawJsonInput.value);
    if (Array.isArray(parsed)) {
      blocks.value = parsed.map((b) => normalizeBlock(b));
      emitUpdate();
      showJsonModal.value = false;
      cyberToast.success('Đã áp dụng cấu hình JSON vào Flow Blocks');
    } else {
      cyberToast.error('Dữ liệu JSON phải là một mảng (array) các blocks');
    }
  } catch {
    cyberToast.error('Cấu trúc JSON không hợp lệ');
  }
}
</script>
