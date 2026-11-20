<template>
  <div class="card bg-base-200/60 border border-base-300 rounded-xl shadow-sm backdrop-blur-md p-4">
    <div class="pb-3 mb-3 border-b border-base-content/10 font-bold text-base">Tạo Preconfig mới</div>
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- SO_NUMBER -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold">SO_NUMBER *</span></label>
          <select v-model="form.soNumber" class="select select-bordered w-full" :disabled="optionsLoading">
            <option value="">Chọn SO_NUMBER</option>
            <option v-for="so in options.soNumbers" :key="so" :value="so">{{ so }}</option>
          </select>
        </div>
        <!-- WA_NUMBER -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold">WA_NUMBER *</span></label>
          <select v-model="form.waNumber" class="select select-bordered w-full" :disabled="!form.soNumber || optionsLoading">
            <option value="">Chọn WA_NUMBER</option>
            <option v-for="wa in options.waNumbers" :key="wa" :value="wa">{{ wa }}</option>
          </select>
        </div>
        <!-- ITEM_CODE -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text font-semibold">ITEM_CODE *</span></label>
          <select v-model="form.itemCode" class="select select-bordered w-full" :disabled="!form.waNumber || optionsLoading">
            <option value="">Chọn ITEM_CODE</option>
            <option v-for="item in options.itemCodes" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';

const form = reactive({ soNumber: '', waNumber: '', itemCode: '' });
const options = reactive({ soNumbers: [], waNumbers: [], itemCodes: [] });
const optionsLoading = ref(false);

onMounted(() => {
  // Logic load options sẽ được kết nối với backend PreconfigAdapterController
});
</script>
