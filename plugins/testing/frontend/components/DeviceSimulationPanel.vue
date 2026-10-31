<template>
  <div class="device-simulation-panel space-y-4">
    <!-- Top HUD Banner -->
    <div class="cyber-hud-banner p-4 rounded-xl bg-base-200/70 border border-base-300 relative backdrop-blur-md shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Cpu class="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-primary tracking-wider uppercase">LoRaWAN Device Simulator</span>
              <span
                class="badge badge-xs font-mono uppercase"
                :class="joinStatus === 'JOINED' ? 'badge-success' : joinStatus === 'JOINING' ? 'badge-warning animate-pulse' : 'badge-ghost'"
              >
                {{ joinStatus }}
              </span>
              <span v-if="flowRunning" class="badge badge-xs badge-info animate-pulse font-mono">
                FLOW RUNNING ({{ flowSpeed }}x)
              </span>
              <span v-else-if="autoLoopActive" class="badge badge-xs badge-info animate-pulse font-mono">
                LOOPING ({{ autoIntervalSec }}s)
              </span>
            </div>
            <div class="text-xs text-base-content/70 mt-0.5">
              Giả lập Node LoRaWAN (OTAA/ABP), điều chế RF, phát sinh payload cảm biến &amp; tương tác đa chiều với Gateway/ChirpStack
            </div>
          </div>
        </div>

        <!-- Quick Status Metrics -->
        <div class="flex items-center gap-2 flex-wrap text-xs">
          <div class="px-3 py-1.5 rounded-lg bg-base-100 border border-base-300 flex items-center gap-2">
            <span class="text-base-content/60">Băng Tần:</span>
            <span class="font-mono font-bold text-primary">{{ config.region }}</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-base-100 border border-base-300 flex items-center gap-2">
            <span class="text-base-content/60">Điều Chế:</span>
            <span class="font-mono font-bold text-accent">{{ config.sf }} / {{ config.bw }}kHz</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-base-100 border border-base-300 flex items-center gap-2">
            <span class="text-base-content/60">Airtime (ToA):</span>
            <span class="font-mono font-bold text-success">{{ calculatedToA }} ms</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-base-100 border border-base-300 flex items-center gap-2">
            <span class="text-base-content/60">Uplink FCnt:</span>
            <span class="font-mono font-bold text-info">{{ fCnt }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin & Sub-Admin Simulation Profile Linkage Card -->
    <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm p-4 backdrop-blur-md">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-content/10">
        <div class="flex items-center gap-2">
          <BookmarkCheck class="w-4 h-4 text-primary" />
          <div>
            <div class="font-bold text-sm flex items-center gap-2">
              <span>Liên Kết Thiết Bị Mẫu &amp; Kịch Bản Giả Lập</span>
              <span class="badge badge-xs badge-primary font-mono">ADMIN &amp; SUB-ADMIN</span>
            </div>
            <div class="text-[11px] text-base-content/60">
              Gán Simu ID với Item Code và Long_FW để tự động nạp cấu hình và kích hoạt kịch bản chạy test
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-outline btn-primary btn-xs" @click="showCreateModal = true">
            <Plus class="w-3.5 h-3.5" />
            Tạo Thiết Bị Mẫu (Admin)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 items-end">
        <!-- Dropdown Chọn Thiết Bị Cần Test -->
        <div class="md:col-span-5 form-control">
          <label class="label py-1">
            <span class="label-text font-medium text-xs flex items-center gap-1.5">
              <Layers class="w-3.5 h-3.5 text-accent" />
              Chọn Thiết Bị Cần Test (Mẫu Đã Gán Simu ID)
            </span>
          </label>
          <select
            v-model="selectedProfileId"
            class="select select-bordered select-sm w-full font-mono text-xs"
            @change="onProfileSelected"
          >
            <option v-for="prof in simulationProfiles" :key="prof.simuId" :value="prof.simuId">
              [{{ prof.simuId }}] {{ prof.itemCode }} - {{ prof.targetDeviceName }}
            </option>
          </select>
        </div>

        <!-- Active Profile Info Details -->
        <div class="md:col-span-7 flex flex-wrap items-center gap-2 p-2 rounded-lg bg-base-100 border border-base-300">
          <div class="flex items-center gap-1 text-xs">
            <span class="text-base-content/50">Simu ID:</span>
            <span class="badge badge-sm badge-primary font-mono font-bold">{{ activeProfile.simuId }}</span>
          </div>
          <div class="divider divider-horizontal m-0"></div>
          <div class="flex items-center gap-1 text-xs">
            <span class="text-base-content/50">Item Code:</span>
            <span class="badge badge-sm badge-neutral font-mono">{{ activeProfile.itemCode }}</span>
          </div>
          <div class="divider divider-horizontal m-0"></div>
          <div class="flex items-center gap-1 text-xs">
            <span class="text-base-content/50">Long FW:</span>
            <span class="badge badge-sm badge-accent font-mono text-[11px] truncate max-w-[200px]" :title="activeProfile.longFw">
              {{ activeProfile.longFw }}
            </span>
          </div>
          <div class="divider divider-horizontal m-0"></div>
          <div class="flex items-center gap-1 text-xs">
            <span class="text-base-content/50">Flow Test:</span>
            <span class="badge badge-sm badge-info font-mono">{{ activeProfile.flowDurationMinutes }} phút</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid: 2 Columns on desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <!-- Left Column: Device Config & Payload Builder (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        <!-- Card 1: LoRaWAN Device Credentials -->
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm p-4 backdrop-blur-md">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-base-content/10">
            <h3 class="font-bold text-sm flex items-center gap-2">
              <Key class="w-4 h-4 text-primary" />
              Định Danh &amp; Khóa Bảo Mật (Credentials)
            </h3>
            <div class="join">
              <button
                class="btn btn-xs join-item"
                :class="config.activation === 'OTAA' ? 'btn-primary' : 'btn-ghost'"
                @click="config.activation = 'OTAA'"
              >
                OTAA (Khuyên Dùng)
              </button>
              <button
                class="btn btn-xs join-item"
                :class="config.activation === 'ABP' ? 'btn-primary' : 'btn-ghost'"
                @click="config.activation = 'ABP'"
              >
                ABP (Manual)
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <!-- Device Name & Serial -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">Device Name / Serial</span>
              </label>
              <input
                v-model="config.deviceName"
                type="text"
                placeholder="LORA-NODE-DEV01"
                class="input input-bordered input-sm font-mono w-full"
              />
            </div>

            <!-- Target Gateway EUI -->
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">Gateway EUI (Phát sóng qua)</span>
              </label>
              <input
                v-model="config.gatewayEui"
                type="text"
                placeholder="AA555A0000001024"
                class="input input-bordered input-sm font-mono w-full"
              />
            </div>

            <!-- OTAA Fields -->
            <template v-if="config.activation === 'OTAA'">
              <div class="form-control">
                <div class="flex items-center justify-between">
                  <label class="label py-1">
                    <span class="label-text font-medium text-xs">DevEUI (16 Hex)</span>
                  </label>
                  <button type="button" class="btn btn-ghost btn-xs text-primary" @click="generateRandomDevEui">
                    Random
                  </button>
                </div>
                <input
                  v-model="config.devEui"
                  type="text"
                  maxlength="16"
                  placeholder="70B3D57ED005ABCD"
                  class="input input-bordered input-sm font-mono w-full"
                />
              </div>

              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">AppEUI / JoinEUI (16 Hex)</span>
                </label>
                <input
                  v-model="config.appEui"
                  type="text"
                  maxlength="16"
                  placeholder="0000000000000000"
                  class="input input-bordered input-sm font-mono w-full"
                />
              </div>

              <div class="form-control md:col-span-2">
                <div class="flex items-center justify-between">
                  <label class="label py-1">
                    <span class="label-text font-medium text-xs">AppKey (32 Hex Secret Key)</span>
                  </label>
                  <button type="button" class="btn btn-ghost btn-xs text-primary" @click="generateRandomAppKey">
                    Random
                  </button>
                </div>
                <input
                  v-model="config.appKey"
                  type="text"
                  maxlength="32"
                  placeholder="2B7E151628AED2A6ABF7158809CF4F3C"
                  class="input input-bordered input-sm font-mono w-full"
                />
              </div>
            </template>

            <!-- ABP Fields -->
            <template v-else>
              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">DevAddr (8 Hex)</span>
                </label>
                <input
                  v-model="config.devAddr"
                  type="text"
                  maxlength="8"
                  placeholder="26011234"
                  class="input input-bordered input-sm font-mono w-full"
                />
              </div>

              <div class="form-control">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">Network ID / NetID</span>
                </label>
                <input
                  v-model="config.netId"
                  type="text"
                  placeholder="000013"
                  class="input input-bordered input-sm font-mono w-full"
                />
              </div>

              <div class="form-control md:col-span-2">
                <label class="label py-1">
                  <span class="label-text font-medium text-xs">NwkSKey &amp; AppSKey (Session Keys)</span>
                </label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    v-model="config.nwkSKey"
                    type="text"
                    maxlength="32"
                    placeholder="NwkSKey (32 Hex)"
                    class="input input-bordered input-sm font-mono w-full"
                  />
                  <input
                    v-model="config.appSKey"
                    type="text"
                    maxlength="32"
                    placeholder="AppSKey (32 Hex)"
                    class="input input-bordered input-sm font-mono w-full"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Card 2: RF Parameters & Modulation -->
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm p-4 backdrop-blur-md">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-base-content/10">
            <h3 class="font-bold text-sm flex items-center gap-2">
              <Radio class="w-4 h-4 text-accent" />
              Thông Số Vô Tuyến &amp; Kênh Truyền (RF Parameters)
            </h3>
            <span class="badge badge-sm badge-outline font-mono">LoRaWAN 1.0.3 / 1.0.4</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">Region Plan</span>
              </label>
              <select v-model="config.region" class="select select-bordered select-sm w-full">
                <option value="AS923-1">AS923-1 (923.2 MHz)</option>
                <option value="AS923-2">AS923-2 (921.4 MHz)</option>
                <option value="EU868">EU868 (868.1 MHz)</option>
                <option value="US915">US915 (902.3 MHz)</option>
                <option value="VN923">VN923 (921.0 MHz)</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">Spreading Factor</span>
              </label>
              <select v-model="config.sf" class="select select-bordered select-sm w-full font-mono">
                <option value="SF7">SF7 (Fastest)</option>
                <option value="SF8">SF8</option>
                <option value="SF9">SF9</option>
                <option value="SF10">SF10</option>
                <option value="SF11">SF11</option>
                <option value="SF12">SF12 (Long Range)</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">Bandwidth (BW)</span>
              </label>
              <select v-model="config.bw" class="select select-bordered select-sm w-full font-mono">
                <option :value="125">125 kHz</option>
                <option :value="250">250 kHz</option>
                <option :value="500">500 kHz</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-medium text-xs">TX Power</span>
              </label>
              <select v-model="config.txPower" class="select select-bordered select-sm w-full font-mono">
                <option :value="14">14 dBm (25mW)</option>
                <option :value="16">16 dBm (40mW)</option>
                <option :value="20">20 dBm (100mW)</option>
              </select>
            </div>

            <!-- RF Signal Simulation Sliders -->
            <div class="form-control col-span-2">
              <label class="label py-1 flex items-center justify-between">
                <span class="label-text font-medium text-xs">Simulated RSSI</span>
                <span class="font-mono font-bold text-primary">{{ config.rssi }} dBm</span>
              </label>
              <input
                v-model.number="config.rssi"
                type="range"
                min="-120"
                max="-40"
                step="1"
                class="range range-primary range-xs"
              />
            </div>

            <div class="form-control col-span-2">
              <label class="label py-1 flex items-center justify-between">
                <span class="label-text font-medium text-xs">Simulated SNR</span>
                <span class="font-mono font-bold text-accent">{{ config.snr > 0 ? '+' : '' }}{{ config.snr }} dB</span>
              </label>
              <input
                v-model.number="config.snr"
                type="range"
                min="-20"
                max="12"
                step="0.5"
                class="range range-accent range-xs"
              />
            </div>
          </div>
        </div>

        <!-- Card 3: Payload Builder & Sensor Presets -->
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm p-4 backdrop-blur-md">
          <div class="flex items-center justify-between pb-2 mb-3 border-b border-base-content/10">
            <h3 class="font-bold text-sm flex items-center gap-2">
              <Layers class="w-4 h-4 text-warning" />
              Bộ Phát Sinh Payload Cảm Biến (Payload Generator)
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs text-base-content/70">FPort:</span>
              <input
                v-model.number="config.fPort"
                type="number"
                min="1"
                max="223"
                class="input input-bordered input-xs w-16 font-mono text-center"
              />
            </div>
          </div>

          <!-- Preset Sensor Selection -->
          <div class="flex flex-wrap gap-1.5 mb-3">
            <button
              v-for="preset in sensorPresets"
              :key="preset.id"
              class="btn btn-xs"
              :class="activePresetId === preset.id ? 'btn-warning text-warning-content shadow-xs' : 'btn-outline'"
              @click="selectPreset(preset.id)"
            >
              {{ preset.name }}
            </button>
          </div>

          <!-- Dynamic Sensor Controls according to active preset -->
          <div v-if="activePresetId === 'env'" class="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-base-100/60 rounded-lg border border-base-300 text-xs mb-3">
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Nhiệt độ (°C)</span>
                <span class="font-mono font-bold text-error">{{ sensorData.temperature }}°C</span>
              </label>
              <input v-model.number="sensorData.temperature" type="range" min="0" max="60" step="0.5" class="range range-error range-xs" @input="updatePayloadHex" />
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Độ ẩm (%)</span>
                <span class="font-mono font-bold text-info">{{ sensorData.humidity }}%</span>
              </label>
              <input v-model.number="sensorData.humidity" type="range" min="10" max="100" step="1" class="range range-info range-xs" @input="updatePayloadHex" />
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Pin (V)</span>
                <span class="font-mono font-bold text-success">{{ sensorData.battery }}V</span>
              </label>
              <input v-model.number="sensorData.battery" type="range" min="2.5" max="3.6" step="0.05" class="range range-success range-xs" @input="updatePayloadHex" />
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Áp suất (hPa)</span>
                <span class="font-mono font-bold text-warning">{{ sensorData.pressure }}</span>
              </label>
              <input v-model.number="sensorData.pressure" type="range" min="950" max="1050" step="1" class="range range-warning range-xs" @input="updatePayloadHex" />
            </div>
          </div>

          <div v-else-if="activePresetId === 'water'" class="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-base-100/60 rounded-lg border border-base-300 text-xs mb-3">
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Chỉ số (m³)</span>
                <span class="font-mono font-bold text-primary">{{ sensorData.waterVolume }}</span>
              </label>
              <input v-model.number="sensorData.waterVolume" type="number" step="0.001" class="input input-bordered input-xs font-mono" @input="updatePayloadHex" />
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Lưu lượng (L/h)</span>
                <span class="font-mono font-bold text-accent">{{ sensorData.flowRate }}</span>
              </label>
              <input v-model.number="sensorData.flowRate" type="range" min="0" max="500" step="10" class="range range-accent range-xs" @input="updatePayloadHex" />
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Van Nước</span>
              </label>
              <select v-model="sensorData.valveStatus" class="select select-bordered select-xs" @change="updatePayloadHex">
                <option value="OPEN">Mở (OPEN)</option>
                <option value="CLOSED">Đóng (CLOSED)</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Pin (V)</span>
                <span class="font-mono font-bold text-success">{{ sensorData.battery }}V</span>
              </label>
              <input v-model.number="sensorData.battery" type="range" min="2.5" max="3.6" step="0.05" class="range range-success range-xs" @input="updatePayloadHex" />
            </div>
          </div>

          <div v-else-if="activePresetId === 'gps'" class="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-base-100/60 rounded-lg border border-base-300 text-xs mb-3">
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Vĩ Độ (Latitude)</span>
              </label>
              <input v-model.number="sensorData.latitude" type="number" step="0.000001" class="input input-bordered input-xs font-mono" @input="updatePayloadHex" />
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Kinh Độ (Longitude)</span>
              </label>
              <input v-model.number="sensorData.longitude" type="number" step="0.000001" class="input input-bordered input-xs font-mono" @input="updatePayloadHex" />
            </div>
            <div class="form-control">
              <label class="label py-0 text-xs">
                <span>Tốc độ (km/h) / Pin</span>
              </label>
              <div class="flex gap-2">
                <input v-model.number="sensorData.speed" type="number" placeholder="Speed" class="input input-bordered input-xs font-mono w-1/2" @input="updatePayloadHex" />
                <input v-model.number="sensorData.battery" type="number" step="0.1" placeholder="Volt" class="input input-bordered input-xs font-mono w-1/2" @input="updatePayloadHex" />
              </div>
            </div>
          </div>

          <!-- Hex & Decoded Preview -->
          <div class="space-y-2">
            <div class="form-control">
              <div class="flex items-center justify-between">
                <label class="label py-0">
                  <span class="label-text font-medium text-xs">Raw Hex Payload:</span>
                </label>
                <span class="text-xs font-mono text-base-content/60">{{ (payloadHex.length / 2).toFixed(0) }} bytes</span>
              </div>
              <input
                v-model="payloadHex"
                type="text"
                placeholder="0167011E02684103020E"
                class="input input-bordered input-sm font-mono text-primary font-bold tracking-wider w-full"
                @input="handleCustomHexInput"
              />
            </div>

            <!-- Decoded JSON View -->
            <div class="p-2.5 rounded-lg bg-base-100 border border-base-300 font-mono text-xs overflow-x-auto">
              <div class="text-base-content/50 text-[10px] uppercase mb-1">Decoded Payload Object (Auto Parsed):</div>
              <pre class="text-xs text-base-content/90">{{ JSON.stringify(decodedPayloadPreview, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Triggers & Simulation Console (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <!-- Control Actions Card -->
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm p-4 backdrop-blur-md">
          <h3 class="font-bold text-sm flex items-center gap-2 pb-2 mb-3 border-b border-base-content/10">
            <Zap class="w-4 h-4 text-primary" />
            Điều Khiển Phát Sóng &amp; Tương Tác
          </h3>

          <div class="space-y-3">
            <!-- Step 1: OTAA Join -->
            <div class="p-3 rounded-lg bg-base-100 border border-base-300 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-xs">1. OTAA Join Procedure</div>
                <div class="text-[11px] text-base-content/60">Gửi Join Request &amp; nhận Join Accept từ NS</div>
              </div>
              <button
                class="btn btn-sm"
                :class="joinStatus === 'JOINED' ? 'btn-success btn-outline' : 'btn-primary'"
                :disabled="joining || joinStatus === 'JOINED'"
                @click="simulateOtaaJoin"
              >
                <span v-if="joining" class="loading loading-spinner loading-xs"></span>
                <span v-else>{{ joinStatus === 'JOINED' ? '✓ Đã Join' : 'Kích Hoạt Join' }}</span>
              </button>
            </div>

            <!-- Step 2: Send Single Uplink -->
            <div class="p-3 rounded-lg bg-base-100 border border-base-300 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-xs">2. Gửi Gói Uplink Đơn</div>
                <div class="text-[11px] text-base-content/60">Bắn gói tin lên Pipeline kiểm thử &amp; ghi nhận</div>
              </div>
              <div class="flex items-center gap-1.5">
                <select v-model="config.packetType" class="select select-bordered select-xs font-mono">
                  <option value="UNCONFIRMED_DATA_UP">Unconf</option>
                  <option value="CONFIRMED_DATA_UP">Conf</option>
                </select>
                <button
                  class="btn btn-primary btn-sm gap-1"
                  :disabled="sendingUplink"
                  @click="sendSingleUplink"
                >
                  <span v-if="sendingUplink" class="loading loading-spinner loading-xs"></span>
                  <Send v-else class="w-3.5 h-3.5" />
                  <span>Phát Sóng</span>
                </button>
              </div>
            </div>

            <!-- Step 3: Simulation Flow Runner (Sub-Admin Thiết Lập) -->
            <div class="p-3 rounded-lg bg-base-100 border border-base-300 space-y-2.5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-xs flex items-center gap-1.5">
                    <span>3. Kịch Bản Simulation Flow</span>
                    <span class="badge badge-xs badge-info font-mono uppercase">Sub-Admin</span>
                  </div>
                  <div class="text-[11px] text-base-content/60">
                    Chạy Flow {{ activeProfile.flowDurationMinutes }}p, Downlink còi lúc 1p, tự kết thúc sau {{ activeProfile.flowDurationMinutes }}p
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <!-- Speed selector -->
                  <select
                    v-model.number="flowSpeed"
                    class="select select-bordered select-xs font-mono"
                    :disabled="flowRunning"
                    title="Tốc độ mô phỏng"
                  >
                    <option :value="1">1x (Chuẩn)</option>
                    <option :value="10">10x (Nhanh)</option>
                    <option :value="60">60x (Siêu tốc 30s)</option>
                  </select>
                </div>
              </div>

              <!-- Flow Status & Progress HUD -->
              <div class="p-2 rounded bg-base-200/70 border border-base-300/80 space-y-1.5 font-mono text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-base-content/60 flex items-center gap-1">
                    <Clock class="w-3.5 h-3.5" />
                    Đếm Ngược Flow:
                  </span>
                  <span class="font-bold text-sm" :class="flowRunning ? 'text-primary animate-pulse' : 'text-base-content/70'">
                    {{ countdownDisplay }} / {{ activeProfile.flowDurationMinutes }}:00
                  </span>
                </div>
                <progress
                  class="progress w-full h-1.5"
                  :class="flowRunning ? 'progress-primary' : 'progress-ghost'"
                  :value="flowProgressPercent"
                  max="100"
                ></progress>
                <div class="flex items-center justify-between text-[10px] text-base-content/60">
                  <span>Tiến độ: {{ flowProgressPercent.toFixed(1) }}% ({{ Math.floor(flowElapsedSeconds / 60) }}m {{ (flowElapsedSeconds % 60).toString().padStart(2, '0') }}s)</span>
                  <span v-if="flowRunning" class="text-success font-bold animate-pulse">FLOW ĐANG CHẠY</span>
                  <span v-else-if="flowCompleted" class="text-info font-bold">HOÀN TẤT ({{ activeProfile.flowDurationMinutes }}P)</span>
                  <span v-else class="text-base-content/40">SẴN SÀNG</span>
                </div>
              </div>

              <!-- Buzzer Actuator Indicator -->
              <div
                v-if="buzzerActive"
                class="p-2 rounded-lg bg-warning/20 border border-warning text-warning text-xs flex items-center justify-between animate-pulse"
              >
                <div class="flex items-center gap-1.5 font-bold">
                  <Bell class="w-4 h-4 text-warning animate-bounce" />
                  <span>CÒI GIẢ LẬP ĐANG KÍCH HOẠT (BUZZER ACTIVE)!</span>
                </div>
                <button class="btn btn-xs btn-warning btn-outline" @click="buzzerActive = false">
                  Tắt Còi
                </button>
              </div>

              <!-- Timed Action Milestones List -->
              <div class="space-y-1 text-[11px]">
                <div
                  v-for="action in activeProfile.timedActions"
                  :key="action.id"
                  class="flex items-center justify-between px-2 py-1 rounded bg-base-200/50 border border-base-300"
                >
                  <div class="flex items-center gap-1.5">
                    <span
                      class="badge badge-xs font-mono"
                      :class="action.executed ? 'badge-success text-success-content' : 'badge-ghost'"
                    >
                      {{ action.executed ? '✓ ĐÃ CHẠY' : `${action.triggerMinute}m` }}
                    </span>
                    <span :class="action.executed ? 'line-through text-base-content/50' : 'text-base-content/80'">
                      {{ action.label }}
                    </span>
                  </div>
                  <span class="font-mono text-[10px] text-base-content/50">Port {{ action.fPort }} ({{ action.payloadHex }})</span>
                </div>
              </div>

              <!-- Flow Control Buttons -->
              <div class="flex items-center gap-2 pt-1">
                <button
                  v-if="!flowRunning"
                  class="btn btn-sm btn-primary flex-1 gap-1"
                  @click="startFlow"
                >
                  <Play class="w-3.5 h-3.5" />
                  <span>Bắt Đầu Chạy Flow</span>
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-error flex-1 gap-1"
                  @click="stopFlow"
                >
                  <Square class="w-3.5 h-3.5" />
                  <span>Dừng Flow</span>
                </button>
                <button
                  class="btn btn-sm btn-ghost btn-square"
                  title="Đặt lại Flow"
                  :disabled="flowRunning"
                  @click="resetFlow"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Step 4: Downlink Rx Window -->
            <div class="p-3 rounded-lg bg-base-100 border border-base-300 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-xs">4. Cửa Sổ Nhận (Rx1 / Rx2)</div>
                <div class="text-[11px] text-base-content/60">Mở Rx sau uplink để thu ACK hoặc lệnh điều khiển</div>
              </div>
              <button class="btn btn-ghost btn-sm text-accent" @click="simulateDownlinkReception">
                Mô Phỏng Rx
              </button>
            </div>
          </div>
        </div>

        <!-- Live Simulation Terminal Log Card -->
        <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm p-4 backdrop-blur-md flex flex-col h-[400px]">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-base-content/10">
            <h3 class="font-bold text-sm flex items-center gap-2">
              <Terminal class="w-4 h-4 text-success" />
              Live Simulation Event Console
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-base-content/50">{{ logs.length }} logs</span>
              <button class="btn btn-ghost btn-xs text-base-content/70" @click="clearLogs">
                Xóa Log
              </button>
            </div>
          </div>

          <div ref="logContainer" class="flex-1 overflow-y-auto p-2.5 rounded-lg bg-black/80 font-mono text-[11px] space-y-1.5 border border-white/10 select-text">
            <div v-if="logs.length === 0" class="text-base-content/40 italic py-6 text-center">
              Chưa có sự kiện nào. Hãy nhấn "Kích Hoạt Join" hoặc "Bắt Đầu Chạy Flow" để bắt đầu mô phỏng.
            </div>
            <div
              v-for="log in logs"
              :key="log.id"
              class="leading-relaxed break-all"
              :class="getLogColor(log.type)"
            >
              <span class="text-base-content/40">[{{ log.time }}]</span>
              <span class="font-bold ml-1">[{{ log.tag }}]</span>
              <span class="ml-1">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Tạo / Liên Kết Thiết Bị Mẫu Mới (Admin) -->
    <dialog class="modal" :class="{ 'modal-open': showCreateModal }">
      <div class="modal-box w-11/12 max-w-2xl bg-base-100 border border-base-300 p-5 shadow-2xl">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-base-content/10">
          <h3 class="font-bold text-base flex items-center gap-2">
            <BookmarkCheck class="w-5 h-5 text-primary" />
            Tạo &amp; Liên Kết Thiết Bị Mẫu (Admin Mode)
          </h3>
          <button class="btn btn-ghost btn-xs btn-circle" @click="showCreateModal = false">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Simu ID *</span></label>
              <input
                v-model="newProfileForm.simuId"
                type="text"
                placeholder="SIMU-LORA-SAMPLE01"
                class="input input-bordered input-sm font-mono"
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Tên Mẫu / Thiết Bị *</span></label>
              <input
                v-model="newProfileForm.targetDeviceName"
                type="text"
                placeholder="LoRa Node Đo Nhiệt Cảnh Báo"
                class="input input-bordered input-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Item Code (Gán thiết bị cần test) *</span></label>
              <input
                v-model="newProfileForm.itemCode"
                type="text"
                placeholder="ITEM-9901-SMART-PLUG"
                class="input input-bordered input-sm font-mono"
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Long FW (Firmware bản dài) *</span></label>
              <input
                v-model="newProfileForm.longFw"
                type="text"
                placeholder="v1.2.0-rc3-long-fw-build9482"
                class="input input-bordered input-sm font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Thời Lượng Flow (Phút)</span></label>
              <input
                v-model.number="newProfileForm.flowDurationMinutes"
                type="number"
                min="1"
                max="180"
                class="input input-bordered input-sm font-mono"
              />
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Kịch Bản Cảm Biến</span></label>
              <select v-model="newProfileForm.presetId" class="select select-bordered select-sm">
                <option value="env">Môi trường (Temp/Humi)</option>
                <option value="water">Đồng hồ nước</option>
                <option value="gps">GPS Tracker</option>
                <option value="custom">Tùy chỉnh HEX</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label py-1"><span class="label-text text-xs font-semibold">Băng Tần LoRa</span></label>
              <select v-model="newProfileForm.region" class="select select-bordered select-sm">
                <option value="AS923-1">AS923-1</option>
                <option value="VN923">VN923</option>
                <option value="EU868">EU868</option>
              </select>
            </div>
          </div>

          <div class="p-2.5 rounded-lg bg-base-200/50 border border-base-300 text-[11px] space-y-1">
            <div class="font-semibold text-primary">Kịch bản mặc định Sub-Admin:</div>
            <div>• Phút 01:00: Downlink bật thiết bị còi giả lập (Port 10, Payload 0101)</div>
            <div>• Phút 05:00: Downlink cấu hình lại chu kỳ đo (Port 10, Payload 02001E)</div>
            <div>• Phút {{ newProfileForm.flowDurationMinutes }}:00: Tự động kết thúc flow mô phỏng</div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="showCreateModal = false">Hủy</button>
          <button class="btn btn-primary btn-sm" @click="saveNewTemplateProfile">Lưu &amp; Liên Kết</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted, nextTick } from 'vue';
import {
  Cpu,
  Key,
  Radio,
  Layers,
  Zap,
  Send,
  Terminal,
  Play,
  Square,
  RotateCcw,
  Clock,
  Bell,
  BookmarkCheck,
  Plus,
} from 'lucide-vue-next';
import { httpClient } from '@/api/client';
import { cyberToast } from '@/services/cyberToast';

export interface TimedFlowAction {
  id: string;
  triggerMinute: number;
  actionType: 'downlink_buzzer' | 'downlink_command' | 'change_rate';
  label: string;
  payloadHex: string;
  fPort: number;
  executed?: boolean;
}

export interface SimulationProfile {
  simuId: string;
  profileName: string;
  itemCode: string;
  longFw: string;
  targetDeviceName: string;
  activation: 'OTAA' | 'ABP';
  devEui: string;
  appEui: string;
  appKey: string;
  devAddr?: string;
  region: string;
  sf: string;
  bw: number;
  fPort: number;
  presetId: string;
  flowDurationMinutes: number;
  autoTerminate: boolean;
  uplinkIntervalSec: number;
  timedActions: TimedFlowAction[];
}

interface SimulationLog {
  id: string;
  time: string;
  tag: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'data';
  message: string;
}

const emit = defineEmits<{
  (e: 'packet-sent', packet: any): void;
  (e: 'packet-emitted', packet: any): void;
}>();

// Initial Template Profiles (Linked by Admin, Flow by Sub-Admin)
const simulationProfiles = reactive<SimulationProfile[]>([
  {
    simuId: 'SIMU-LORA-SP01',
    profileName: 'Ổ Cắm Thông Minh & Còi Báo Động (Chuẩn 30 Phút)',
    itemCode: 'ITEM-9901-SMART-PLUG',
    longFw: 'v1.2.0-rc3-long-fw-build9482',
    targetDeviceName: 'Smart Socket Multi-Sensor Node',
    activation: 'OTAA',
    devEui: '70B3D57ED005ABCD',
    appEui: '0000000000000000',
    appKey: '2B7E151628AED2A6ABF7158809CF4F3C',
    region: 'AS923-1',
    sf: 'SF7',
    bw: 125,
    fPort: 2,
    presetId: 'env',
    flowDurationMinutes: 30,
    autoTerminate: true,
    uplinkIntervalSec: 10,
    timedActions: [
      {
        id: 'act-sp-1',
        triggerMinute: 1,
        actionType: 'downlink_buzzer',
        label: 'Downlink bật thiết bị còi giả lập lúc 1 phút',
        payloadHex: '0101',
        fPort: 10,
        executed: false,
      },
      {
        id: 'act-sp-2',
        triggerMinute: 5,
        actionType: 'downlink_command',
        label: 'Downlink cấu hình chu kỳ đo 15s',
        payloadHex: '02000F',
        fPort: 10,
        executed: false,
      },
      {
        id: 'act-sp-3',
        triggerMinute: 15,
        actionType: 'downlink_buzzer',
        label: 'Downlink tắt thiết bị còi giả lập',
        payloadHex: '0100',
        fPort: 10,
        executed: false,
      },
      {
        id: 'act-sp-4',
        triggerMinute: 30,
        actionType: 'change_rate',
        label: 'Tự động kết thúc Flow sau 30 phút',
        payloadHex: 'FF',
        fPort: 10,
        executed: false,
      },
    ],
  },
  {
    simuId: 'SIMU-LORA-WM02',
    profileName: 'Đồng Hồ Nước Siêu Âm LoRaWAN DN15',
    itemCode: 'ITEM-5520-WATER-METER',
    longFw: 'v2.4.1-long-fw-build1029',
    targetDeviceName: 'Water Meter Ultrasonic DN15',
    activation: 'OTAA',
    devEui: '70B3D57ED0052211',
    appEui: '0000000000000000',
    appKey: '0102030405060708090A0B0C0D0E0F10',
    region: 'VN923',
    sf: 'SF8',
    bw: 125,
    fPort: 1,
    presetId: 'water',
    flowDurationMinutes: 30,
    autoTerminate: true,
    uplinkIntervalSec: 10,
    timedActions: [
      {
        id: 'act-wm-1',
        triggerMinute: 1,
        actionType: 'downlink_buzzer',
        label: 'Downlink đóng van ngắt nước & bật còi cảnh báo',
        payloadHex: 'AA000101',
        fPort: 1,
        executed: false,
      },
      {
        id: 'act-wm-2',
        triggerMinute: 10,
        actionType: 'downlink_command',
        label: 'Downlink mở lại van cấp nước',
        payloadHex: 'AA01',
        fPort: 1,
        executed: false,
      },
      {
        id: 'act-wm-3',
        triggerMinute: 30,
        actionType: 'change_rate',
        label: 'Tự động kết thúc sau 30 phút',
        payloadHex: 'FF',
        fPort: 1,
        executed: false,
      },
    ],
  },
  {
    simuId: 'SIMU-LORA-ENV03',
    profileName: 'Cảm Biến Khí & Cảnh Báo Khói Cháy',
    itemCode: 'ITEM-8812-ENV-SENSOR',
    longFw: 'v1.0.5-long-fw-build3311',
    targetDeviceName: 'Gas & Smoke Industrial Node',
    activation: 'OTAA',
    devEui: '70B3D57ED0059988',
    appEui: '0000000000000000',
    appKey: 'A1B2C3D4E5F60102030405060708090A',
    region: 'AS923-1',
    sf: 'SF7',
    bw: 125,
    fPort: 3,
    presetId: 'env',
    flowDurationMinutes: 30,
    autoTerminate: true,
    uplinkIntervalSec: 10,
    timedActions: [
      {
        id: 'act-env-1',
        triggerMinute: 1,
        actionType: 'downlink_buzzer',
        label: 'Downlink bật còi báo khói giả lập',
        payloadHex: '0101',
        fPort: 10,
        executed: false,
      },
      {
        id: 'act-env-2',
        triggerMinute: 12,
        actionType: 'downlink_buzzer',
        label: 'Downlink tắt còi báo khói',
        payloadHex: '0100',
        fPort: 10,
        executed: false,
      },
      {
        id: 'act-env-3',
        triggerMinute: 30,
        actionType: 'change_rate',
        label: 'Tự động kết thúc sau 30 phút',
        payloadHex: 'FF',
        fPort: 10,
        executed: false,
      },
    ],
  },
]);

const selectedProfileId = ref<string>('SIMU-LORA-SP01');
const activeProfile = computed(() => {
  return simulationProfiles.find((p) => p.simuId === selectedProfileId.value) || simulationProfiles[0];
});

// Admin Modal State
const showCreateModal = ref<boolean>(false);
const newProfileForm = reactive({
  simuId: '',
  targetDeviceName: '',
  itemCode: '',
  longFw: '',
  flowDurationMinutes: 30,
  presetId: 'env',
  region: 'AS923-1',
});

// Flow Engine State
const flowRunning = ref<boolean>(false);
const flowCompleted = ref<boolean>(false);
const flowElapsedSeconds = ref<number>(0);
const flowSpeed = ref<number>(1);
const buzzerActive = ref<boolean>(false);
let flowIntervalTimer: any = null;
let lastUplinkSentSecond = -1;

const countdownDisplay = computed(() => {
  const totalSeconds = (activeProfile.value?.flowDurationMinutes || 30) * 60;
  const remain = Math.max(0, totalSeconds - flowElapsedSeconds.value);
  const m = Math.floor(remain / 60);
  const s = remain % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const flowProgressPercent = computed(() => {
  const totalSeconds = (activeProfile.value?.flowDurationMinutes || 30) * 60;
  if (totalSeconds <= 0) return 0;
  return Math.min(100, (flowElapsedSeconds.value / totalSeconds) * 100);
});

// Simulation Config
const config = reactive({
  deviceName: 'LORA-NODE-PROTOTYPE',
  gatewayEui: 'AA555A0000001024',
  activation: 'OTAA' as 'OTAA' | 'ABP',
  devEui: '70B3D57ED005ABCD',
  appEui: '0000000000000000',
  appKey: '2B7E151628AED2A6ABF7158809CF4F3C',
  devAddr: '26011234',
  netId: '000013',
  nwkSKey: '44A56B12C3456789ABCDEF0123456789',
  appSKey: '88B12C3456789ABCDEF0123456789ABC',
  region: 'AS923-1',
  sf: 'SF7',
  bw: 125,
  txPower: 14,
  rssi: -76,
  snr: 8.5,
  fPort: 2,
  packetType: 'UNCONFIRMED_DATA_UP',
});

const fCnt = ref<number>(1);
const joinStatus = ref<'DISCONNECTED' | 'JOINING' | 'JOINED'>('DISCONNECTED');
const joining = ref<boolean>(false);
const sendingUplink = ref<boolean>(false);
const autoLoopActive = ref<boolean>(false);
const autoIntervalSec = ref<number>(5);
let loopTimer: any = null;

// Presets
const sensorPresets = [
  { id: 'env', name: 'Môi Trường (Temp/Humi/Bat)' },
  { id: 'water', name: 'Đồng Hồ Nước (Pulse/Flow)' },
  { id: 'gps', name: 'GPS Tracker (Lat/Lng)' },
  { id: 'custom', name: 'Tùy Chỉnh HEX' },
];
const activePresetId = ref<string>('env');

const sensorData = reactive({
  temperature: 28.5,
  humidity: 65,
  battery: 3.6,
  pressure: 1013,
  waterVolume: 124.582,
  flowRate: 35,
  valveStatus: 'OPEN',
  latitude: 10.776889,
  longitude: 106.700806,
  speed: 25,
});

const payloadHex = ref<string>('0167011D02684103020E');
const logContainer = ref<HTMLElement | null>(null);
const logs = ref<SimulationLog[]>([]);

// Airtime estimation (ToA - Time on Air in ms)
const calculatedToA = computed(() => {
  const nBytes = Math.max(1, payloadHex.value.length / 2);
  const sfNum = parseInt(config.sf.replace('SF', ''), 10) || 7;
  const bwKHz = config.bw;
  // LoRa symbol duration Ts = 2^SF / BW (ms)
  const ts = Math.pow(2, sfNum) / bwKHz;
  const nPreamble = 8;
  const tPreamble = (nPreamble + 4.25) * ts;
  // Payload symbols approximate
  const payloadSymbNb = 8 + Math.max(Math.ceil((8 * nBytes - 4 * sfNum + 28 + 16) / (4 * sfNum)) * 5, 0);
  const tPayload = payloadSymbNb * ts;
  return (tPreamble + tPayload).toFixed(1);
});

// Decoded Payload preview object
const decodedPayloadPreview = computed(() => {
  if (activePresetId.value === 'env') {
    return {
      temperature: Number(sensorData.temperature.toFixed(1)),
      humidity: Number(sensorData.humidity.toFixed(0)),
      battery: Number(sensorData.battery.toFixed(2)),
      pressure: Number(sensorData.pressure.toFixed(0)),
    };
  } else if (activePresetId.value === 'water') {
    return {
      water_volume_m3: Number(sensorData.waterVolume.toFixed(3)),
      flow_rate_lph: Number(sensorData.flowRate),
      valve_status: sensorData.valveStatus,
      battery: Number(sensorData.battery.toFixed(2)),
    };
  } else if (activePresetId.value === 'gps') {
    return {
      latitude: Number(sensorData.latitude.toFixed(6)),
      longitude: Number(sensorData.longitude.toFixed(6)),
      speed_kmh: Number(sensorData.speed),
      battery: Number(sensorData.battery.toFixed(2)),
    };
  }
  return {
    rawHex: payloadHex.value,
    fPort: config.fPort,
    parsed: true,
  };
});

function addLog(tag: string, message: string, type: 'info' | 'success' | 'warning' | 'error' | 'data' = 'info') {
  const now = new Date();
  const time = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  logs.value.push({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    time,
    tag,
    type,
    message,
  });
  if (logs.value.length > 200) {
    logs.value.shift();
  }
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
}

function clearLogs() {
  logs.value = [];
}

function getLogColor(type: string) {
  switch (type) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-error';
    case 'data':
      return 'text-primary';
    default:
      return 'text-base-content/80';
  }
}

function generateRandomDevEui() {
  const chars = '0123456789ABCDEF';
  let res = '70B3D5';
  for (let i = 0; i < 10; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  config.devEui = res;
  addLog('CONFIG', `Đã sinh DevEUI ngẫu nhiên: ${res}`, 'info');
}

function generateRandomAppKey() {
  const chars = '0123456789ABCDEF';
  let res = '';
  for (let i = 0; i < 32; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  config.appKey = res;
  addLog('CONFIG', `Đã sinh AppKey ngẫu nhiên: ${res}`, 'info');
}

function selectPreset(presetId: string) {
  activePresetId.value = presetId;
  updatePayloadHex();
  addLog('PRESET', `Chuyển kịch bản cảm biến sang: ${presetId.toUpperCase()}`, 'info');
}

function updatePayloadHex() {
  if (activePresetId.value === 'env') {
    // Encode Cayenne LPP-like format:
    // 01 67 (Temp) + 2B val | 02 68 (Humi) + 1B val | 03 02 (Analog/Bat) + 2B val
    const tempVal = Math.round(sensorData.temperature * 10);
    const humVal = Math.round(sensorData.humidity * 2);
    const batVal = Math.round(sensorData.battery * 100);
    const hexTemp = (tempVal & 0xffff).toString(16).padStart(4, '0').toUpperCase();
    const hexHum = (humVal & 0xff).toString(16).padStart(2, '0').toUpperCase();
    const hexBat = (batVal & 0xffff).toString(16).padStart(4, '0').toUpperCase();
    payloadHex.value = `0167${hexTemp}0268${hexHum}0302${hexBat}`;
  } else if (activePresetId.value === 'water') {
    const volInt = Math.round(sensorData.waterVolume * 1000);
    const flowInt = Math.round(sensorData.flowRate);
    const valve = sensorData.valveStatus === 'OPEN' ? '01' : '00';
    const hexVol = (volInt & 0xffffffff).toString(16).padStart(8, '0').toUpperCase();
    const hexFlow = (flowInt & 0xffff).toString(16).padStart(4, '0').toUpperCase();
    payloadHex.value = `0A${hexVol}0B${hexFlow}0C${valve}`;
  } else if (activePresetId.value === 'gps') {
    const latInt = Math.round((sensorData.latitude + 90) * 10000);
    const lngInt = Math.round((sensorData.longitude + 180) * 10000);
    const hexLat = (latInt & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
    const hexLng = (lngInt & 0xffffff).toString(16).padStart(6, '0').toUpperCase();
    payloadHex.value = `88${hexLat}${hexLng}`;
  }
}

function handleCustomHexInput() {
  payloadHex.value = payloadHex.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
}

// OTAA Join Procedure Simulation
async function simulateOtaaJoin() {
  if (joining.value || joinStatus.value === 'JOINED') return;
  joining.value = true;
  joinStatus.value = 'JOINING';

  addLog(
    'JOIN_REQ',
    `Node gửi Join Request -> DevEUI: ${config.devEui}, JoinEUI: ${config.appEui}, DevNonce: 0x${Math.floor(Math.random() * 65535).toString(16).toUpperCase()}`,
    'warning'
  );

  setTimeout(() => {
    addLog(
      'NS_AUTH',
      `ChirpStack Network Server xác thực MIC với AppKey: ${config.appKey.substring(0, 8)}... - Hợp lệ!`,
      'info'
    );
  }, 1000);

  setTimeout(() => {
    config.devAddr = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0').toUpperCase();
    joinStatus.value = 'JOINED';
    joining.value = false;
    addLog(
      'JOIN_ACCEPT',
      `Nhận Join Accept! Cấp DevAddr=${config.devAddr}, NetID=${config.netId}, Deriving Session Keys (NwkSKey/AppSKey) -> JOINED SUCCESS!`,
      'success'
    );
    cyberToast.success('Mô phỏng OTAA Join thành công!');
  }, 2200);
}

// Send Single Uplink Packet
async function sendSingleUplink() {
  if (sendingUplink.value) return;
  sendingUplink.value = true;

  const currentCount = fCnt.value;
  const isConf = config.packetType === 'CONFIRMED_DATA_UP';
  const rawPayload = payloadHex.value;
  const decodedPayload = decodedPayloadPreview.value;

  addLog(
    'TX_UP',
    `Uplink FCnt=${currentCount} | FPort=${config.fPort} | ${isConf ? 'CONFIRMED' : 'UNCONFIRMED'} | ToA=${calculatedToA.value}ms | RSSI=${config.rssi}dBm | SNR=${config.snr}dB`,
    'data'
  );
  addLog('PAYLOAD', `Hex: ${rawPayload} | Decoded: ${JSON.stringify(decodedPayload)}`, 'info');

  try {
    const packetDto = {
      networkId: config.activation === 'OTAA' ? config.devEui : config.devAddr,
      packetType: isConf ? 'confirmed_data_up' : 'unconfirmed_data_up',
      fPort: config.fPort,
      fCnt: currentCount,
      rawPayload,
      decodedPayload,
      rfInfo: {
        gateway_id: config.gatewayEui,
        rssi: config.rssi,
        snr: config.snr,
        frequency: config.region.includes('868') ? 868100000 : 923200000,
        sf: parseInt(config.sf.replace('SF', ''), 10) || 7,
        bw: config.bw,
      },
    };

    // Post to backend ingestion pipeline
    const res: any = await httpClient.post('/plugins/testing/packets', packetDto);
    addLog('RX_GATEWAY', `Gateway ${config.gatewayEui} thu nhận và chuyển tiếp lên ChirpStack NS thành công`, 'success');
    emit('packet-sent', res?.data || packetDto);
    fCnt.value++;

    // If Confirmed, simulate downlink ACK reception in Rx window
    if (isConf) {
      setTimeout(() => {
        addLog('RX1_OPEN', `Cửa sổ Rx1 mở sau 1.0s -> Nhận Downlink ACK (fCntAck=${currentCount})`, 'success');
      }, 1000);
    }
  } catch (err: any) {
    // If backend 404/not found target device, fallback to logging
    addLog('PIPE_WARN', `Đã ghi nhận gói tin qua local buffer: ${err?.message || 'Logged'}`, 'warning');
    emit('packet-sent', {
      networkId: config.devEui,
      fCnt: currentCount,
      rawPayload,
      decodedPayload,
    });
    fCnt.value++;
  } finally {
    sendingUplink.value = false;
  }
}

// Auto Loop Toggle
function toggleAutoLoop() {
  if (autoLoopActive.value) {
    stopAutoLoop();
  } else {
    startAutoLoop();
  }
}

function startAutoLoop() {
  autoLoopActive.value = true;
  addLog('LOOP', `Bắt đầu Auto Simulation Loop (Chu kỳ: ${autoIntervalSec.value}s)`, 'warning');
  sendSingleUplink();

  loopTimer = setInterval(() => {
    // Random walk sensor readings slightly
    if (activePresetId.value === 'env') {
      const deltaTemp = (Math.random() - 0.5) * 0.4;
      const deltaHum = (Math.random() - 0.5) * 1.5;
      sensorData.temperature = Math.max(15, Math.min(45, sensorData.temperature + deltaTemp));
      sensorData.humidity = Math.max(30, Math.min(95, sensorData.humidity + deltaHum));
    } else if (activePresetId.value === 'water') {
      sensorData.waterVolume += 0.002;
    }
    updatePayloadHex();
    sendSingleUplink();
  }, autoIntervalSec.value * 1000);
}

function stopAutoLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  autoLoopActive.value = false;
  addLog('LOOP', 'Đã dừng Auto Simulation Loop', 'info');
}

// Simulate Downlink Reception
function simulateDownlinkReception() {
  addLog('RX1_OPEN', 'Mở cửa sổ nhận Rx1 (Delay 1.0s, Frequency 923.2 MHz)...', 'info');
  setTimeout(() => {
    addLog('RX2_OPEN', 'Mở cửa sổ nhận Rx2 (Delay 2.0s, Frequency 923.2 MHz SF10)...', 'info');
    setTimeout(() => {
      addLog('DOWNLINK', 'Nhận gói tin Downlink từ Server: FPort=1, Payload=0xAA01 (Valve Control Command)', 'success');
      cyberToast.info('Đã nhận gói Downlink từ Network Server!');
    }, 500);
  }, 1000);
}

// Flow Engine & Simulation Profile Handlers
function onProfileSelected() {
  const p = simulationProfiles.find((item) => item.simuId === selectedProfileId.value);
  if (!p) return;
  config.deviceName = p.targetDeviceName;
  config.activation = p.activation;
  config.devEui = p.devEui;
  config.appEui = p.appEui;
  config.appKey = p.appKey;
  if (p.devAddr) config.devAddr = p.devAddr;
  config.region = p.region;
  config.sf = p.sf;
  config.bw = p.bw;
  config.fPort = p.fPort;
  selectPreset(p.presetId);
  resetFlow();
  addLog('PROFILE', `Đã liên kết Profile [${p.simuId}] - Item Code: ${p.itemCode} - Long FW: ${p.longFw}`, 'info');
}

function startFlow() {
  if (flowRunning.value) return;
  if (flowCompleted.value) {
    resetFlow();
  }
  flowRunning.value = true;
  flowCompleted.value = false;
  addLog('FLOW_START', `Bắt đầu chạy flow giả lập: ${activeProfile.value.simuId} (${activeProfile.value.flowDurationMinutes} phút, Tốc độ ${flowSpeed.value}x)`, 'warning');
  cyberToast.success(`Bắt đầu chạy Flow giả lập (${activeProfile.value.flowDurationMinutes} phút)`);

  if (lastUplinkSentSecond === -1) {
    sendSingleUplink();
    lastUplinkSentSecond = 0;
  }

  let lastTick = Date.now();
  flowIntervalTimer = setInterval(() => {
    const now = Date.now();
    const deltaSec = ((now - lastTick) / 1000) * flowSpeed.value;
    lastTick = now;
    flowElapsedSeconds.value += deltaSec;

    // Check timed action milestones
    if (activeProfile.value?.timedActions) {
      for (const action of activeProfile.value.timedActions) {
        if (!action.executed && flowElapsedSeconds.value >= action.triggerMinute * 60) {
          action.executed = true;
          executeFlowAction(action);
        }
      }
    }

    // Periodic Uplink
    const intervalSec = activeProfile.value.uplinkIntervalSec || 10;
    if (flowElapsedSeconds.value - lastUplinkSentSecond >= intervalSec) {
      lastUplinkSentSecond = flowElapsedSeconds.value;
      if (activePresetId.value === 'env') {
        const deltaTemp = (Math.random() - 0.5) * 0.4;
        const deltaHum = (Math.random() - 0.5) * 1.5;
        sensorData.temperature = Math.max(15, Math.min(45, Number((sensorData.temperature + deltaTemp).toFixed(1))));
        sensorData.humidity = Math.max(30, Math.min(95, Math.round(sensorData.humidity + deltaHum)));
      } else if (activePresetId.value === 'water') {
        sensorData.waterVolume = Number((sensorData.waterVolume + 0.002).toFixed(3));
      }
      updatePayloadHex();
      sendSingleUplink();
    }

    // Termination after total duration
    const totalSeconds = (activeProfile.value.flowDurationMinutes || 30) * 60;
    if (flowElapsedSeconds.value >= totalSeconds) {
      finishFlow();
    }
  }, 250);
}

function executeFlowAction(action: TimedFlowAction) {
  if (action.actionType === 'downlink_buzzer') {
    if (action.payloadHex === '0101' || action.payloadHex.includes('0101')) {
      buzzerActive.value = true;
      addLog('ACTUATOR', `[Phút ${action.triggerMinute}] Downlink FPort ${action.fPort} (0x${action.payloadHex}) -> KÍCH HOẠT CÒI BÁO ĐỘNG GIẢ LẬP!`, 'warning');
      cyberToast.warning(`[Flow] Kích hoạt còi giả lập lúc ${action.triggerMinute} phút!`);
    } else {
      buzzerActive.value = false;
      addLog('ACTUATOR', `[Phút ${action.triggerMinute}] Downlink FPort ${action.fPort} (0x${action.payloadHex}) -> TẮT CÒI BÁO ĐỘNG GIẢ LẬP.`, 'info');
      cyberToast.info(`[Flow] Đã tắt còi giả lập lúc ${action.triggerMinute} phút.`);
    }
  } else if (action.actionType === 'downlink_command') {
    addLog('DOWNLINK_CMD', `[Phút ${action.triggerMinute}] Lệnh Downlink Port ${action.fPort} (0x${action.payloadHex}): ${action.label}`, 'success');
    cyberToast.info(`[Flow Downlink] ${action.label}`);
  } else if (action.actionType === 'change_rate') {
    addLog('FLOW_STEP', `[Phút ${action.triggerMinute}] ${action.label}`, 'info');
  }
}

function stopFlow() {
  if (flowIntervalTimer) {
    clearInterval(flowIntervalTimer);
    flowIntervalTimer = null;
  }
  flowRunning.value = false;
  addLog('FLOW_STOP', `Đã tạm dừng Flow giả lập tại thời điểm ${countdownDisplay.value}`, 'info');
}

function finishFlow() {
  if (flowIntervalTimer) {
    clearInterval(flowIntervalTimer);
    flowIntervalTimer = null;
  }
  flowRunning.value = false;
  flowCompleted.value = true;
  buzzerActive.value = false;
  addLog('FLOW_COMPLETE', `Flow giả lập [${activeProfile.value.simuId}] đã chạy xong ${activeProfile.value.flowDurationMinutes} phút và tự động kết thúc!`, 'success');
  cyberToast.success(`Flow giả lập đã kết thúc thành công sau ${activeProfile.value.flowDurationMinutes} phút!`);
}

function resetFlow() {
  if (flowIntervalTimer) {
    clearInterval(flowIntervalTimer);
    flowIntervalTimer = null;
  }
  flowRunning.value = false;
  flowCompleted.value = false;
  flowElapsedSeconds.value = 0;
  lastUplinkSentSecond = -1;
  buzzerActive.value = false;
  if (activeProfile.value?.timedActions) {
    activeProfile.value.timedActions.forEach((act) => {
      act.executed = false;
    });
  }
  addLog('FLOW_RESET', 'Đã đặt lại bộ đếm Flow giả lập về 00:00', 'info');
}

function saveNewTemplateProfile() {
  if (!newProfileForm.simuId || !newProfileForm.itemCode) {
    cyberToast.warning('Vui lòng nhập Simu ID và Item Code!');
    return;
  }

  const durationMin = newProfileForm.flowDurationMinutes || 30;
  const newProfile: SimulationProfile = {
    simuId: newProfileForm.simuId.trim().toUpperCase(),
    profileName: newProfileForm.targetDeviceName.trim() || newProfileForm.simuId.trim(),
    itemCode: newProfileForm.itemCode.trim().toUpperCase(),
    longFw: newProfileForm.longFw.trim() || 'v1.0.0-long-fw-default',
    targetDeviceName: newProfileForm.targetDeviceName.trim() || 'Custom Prototype Node',
    activation: 'OTAA',
    devEui: '70B3D57E' + Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase().padStart(8, '0'),
    appEui: '0000000000000000',
    appKey: '2B7E151628AED2A6ABF7158809CF4F3C',
    region: newProfileForm.region || 'AS923-1',
    sf: 'SF7',
    bw: 125,
    fPort: 10,
    presetId: newProfileForm.presetId,
    flowDurationMinutes: durationMin,
    autoTerminate: true,
    uplinkIntervalSec: 10,
    timedActions: [
      {
        id: `act-${Date.now()}-1`,
        triggerMinute: 1,
        actionType: 'downlink_buzzer',
        label: 'Downlink bật thiết bị còi giả lập lúc 1 phút',
        payloadHex: '0101',
        fPort: 10,
        executed: false,
      },
      {
        id: `act-${Date.now()}-2`,
        triggerMinute: Math.max(2, Math.floor(durationMin / 2)),
        actionType: 'downlink_buzzer',
        label: 'Downlink tắt thiết bị còi giả lập',
        payloadHex: '0100',
        fPort: 10,
        executed: false,
      },
      {
        id: `act-${Date.now()}-3`,
        triggerMinute: durationMin,
        actionType: 'change_rate',
        label: `Tự động kết thúc sau ${durationMin} phút`,
        payloadHex: 'FF',
        fPort: 10,
        executed: false,
      },
    ],
  };

  simulationProfiles.push(newProfile);
  selectedProfileId.value = newProfile.simuId;
  onProfileSelected();
  showCreateModal.value = false;
  addLog('ADMIN', `Admin tạo thành công thiết bị mẫu mới: ${newProfile.simuId} gắn với Item Code ${newProfile.itemCode}`, 'success');
  cyberToast.success(`Đã lưu thiết bị mẫu ${newProfile.simuId} thành công!`);
}

onUnmounted(() => {
  if (loopTimer) {
    clearInterval(loopTimer);
  }
  if (flowIntervalTimer) {
    clearInterval(flowIntervalTimer);
  }
});

// Initialize with valid payload hex and default profile config
updatePayloadHex();
onProfileSelected();
</script>

<style scoped>
.cyber-hud-banner {
  background: linear-gradient(135deg, rgba(20, 27, 45, 0.7) 0%, rgba(13, 18, 30, 0.8) 100%);
}
</style>
