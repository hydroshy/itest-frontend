<template>
  <form class="space-y-4 border border-base-300 rounded-xl bg-base-200 p-4" @submit.prevent="save">
    <h3 class="font-bold">Cấu hình AutoCheck theo sản phẩm</h3>
    <p v-if="error" role="alert" class="text-error break-words">{{ error }}</p>
    <p v-if="notice" role="status">{{ notice }}</p>
    <label class="block space-y-1">
      <span>AUTOCHECK_ID</span>
      <input :value="autocheckId || 'Hệ thống sinh mã khi lưu'" readonly class="input input-bordered w-full font-mono" />
    </label>
    <label class="block space-y-1">
      <span>Tên AutoCheck</span>
      <input v-model="name" required maxlength="255" class="input input-bordered w-full" />
    </label>
    <label class="flex items-center gap-2 min-h-11">
      <input v-model="useReference" type="checkbox" class="checkbox" />
      Dùng thiết bị tham chiếu (thiết bị mẫu)
    </label>
    <section v-for="side in activeSides" :key="side.key" class="space-y-3 border-t border-base-300 pt-4">
      <h4 class="font-semibold">{{ side.label }}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label class="block space-y-1">
          <span>ITEM_CODE</span>
          <input v-model="side.item_code" required class="input input-bordered w-full font-mono" @input="invalidate(side)" />
        </label>
        <label class="block space-y-1">
          <span>FW_VERSION</span>
          <input v-model="side.fw_version" required class="input input-bordered w-full font-mono" @input="invalidate(side)" />
        </label>
      </div>
      <button type="button" class="btn min-h-11" :disabled="side.loading || !side.item_code.trim() || !side.fw_version.trim()" @click="discover(side)">
        {{ side.loading ? 'Đang lấy field…' : 'Lấy field từ dữ liệu giải mã' }}
      </button>
      <p v-if="side.error" role="alert" class="text-error">{{ side.error }}</p>
      <p v-if="side.loaded && !side.fields.length">Chưa có field giải mã cho sản phẩm và firmware này.</p>
      <div v-for="(rule, index) in side.rules" :key="index" class="space-y-3 border border-base-300 rounded-lg p-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label class="block space-y-1">
            <span>Field cần kiểm tra</span>
            <select v-model="rule.field" required class="select select-bordered w-full">
              <option value="" disabled>Chọn field</option>
              <option v-for="field in side.fields" :key="field" :value="field">{{ field }}</option>
            </select>
          </label>
          <label class="block space-y-1">
            <span>Count: số mẫu đạt tối thiểu</span>
            <input v-model.number="rule.count" type="number" min="1" step="1" required class="input input-bordered w-full" />
          </label>
          <label class="block space-y-1">
            <span>Điều kiện</span>
            <select v-model="rule.mode" class="select select-bordered w-full">
              <option value="present">Field có dữ liệu</option>
              <option value="range">Khoảng giá trị (min / max)</option>
              <option value="equals">Bằng giá trị JSON</option>
            </select>
          </label>
          <template v-if="rule.mode === 'range'">
            <label class="block space-y-1"><span>Min (tùy chọn)</span><input v-model="rule.min" type="number" step="any" class="input input-bordered w-full" /></label>
            <label class="block space-y-1"><span>Max (tùy chọn)</span><input v-model="rule.max" type="number" step="any" class="input input-bordered w-full" /></label>
          </template>
          <label v-else-if="rule.mode === 'equals'" class="block space-y-1"><span>Giá trị JSON: 25, true hoặc "OK"</span><input v-model="rule.equals" required class="input input-bordered w-full font-mono" /></label>
        </div>
        <button type="button" class="btn btn-ghost min-h-11" @click="side.rules.splice(index, 1)">Bỏ điều kiện {{ index + 1 }}</button>
      </div>
      <button type="button" class="btn min-h-11" :disabled="!side.fields.length" @click="side.rules.push(newRule())">Thêm điều kiện</button>
    </section>
    <section v-if="useReference" class="space-y-3 border-t border-base-300 pt-4">
      <h4 class="font-semibold">So sánh DUT với thiết bị mẫu</h4>
      <p class="text-sm">Dùng mẫu mới nhất mỗi bên. Sai số là chênh lệch tuyệt đối.</p>
      <div v-for="(comparison, index) in comparisons" :key="index" class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label class="block"><span>Field DUT</span><select v-model="comparison.dut_field" required class="select select-bordered w-full"><option value="" disabled>Chọn field</option><option v-for="field in dut.fields" :key="field">{{ field }}</option></select></label>
        <label class="block"><span>Field mẫu</span><select v-model="comparison.reference_field" required class="select select-bordered w-full"><option value="" disabled>Chọn field</option><option v-for="field in reference.fields" :key="field">{{ field }}</option></select></label>
        <label class="block"><span>Sai số cho phép</span><input v-model.number="comparison.tolerance" type="number" min="0" step="any" required class="input input-bordered w-full" /></label>
        <button type="button" class="btn self-end min-h-11" @click="comparisons.splice(index, 1)">Bỏ so sánh {{ index + 1 }}</button>
      </div>
      <button type="button" class="btn min-h-11" :disabled="!dut.fields.length || !reference.fields.length" @click="comparisons.push({ dut_field: '', reference_field: '', tolerance: 0 })">Thêm so sánh</button>
    </section>
    <button type="submit" class="btn btn-primary min-h-11" :disabled="saving">{{ saving ? 'Đang lưu…' : 'Lưu cấu hình AutoCheck' }}</button>
    <button v-if="profileId" type="button" class="btn min-h-11" :disabled="saving" @click="profileId = ''; autocheckId = ''; name = ''; notice = ''; error = ''">Tạo cấu hình khác</button>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { httpClient } from '@/api/httpClient';

type Rule = { field: string; count: number; mode: string; min: string; max: string; equals: string };
type Side = { key: string; label: string; item_code: string; fw_version: string; fields: string[]; rules: Rule[]; loading: boolean; loaded: boolean; error: string; revision: number };
const newRule = (): Rule => ({ field: '', count: 1, mode: 'range', min: '', max: '', equals: '' });
const makeSide = (key: string, label: string): Side => ({ key, label, item_code: '', fw_version: '', fields: [], rules: [], loading: false, loaded: false, error: '', revision: 0 });
const dut = reactive(makeSide('dut', 'Thiết bị cần kiểm tra (DUT)'));
const reference = reactive(makeSide('reference', 'Thiết bị tham chiếu'));
const activeSides = computed(() => useReference.value ? [dut, reference] : [dut]);
const useReference = ref(false);
const name = ref('');
const autocheckId = ref('');
const profileId = ref('');
const saving = ref(false);
const error = ref('');
const notice = ref('');
const comparisons = reactive<{ dut_field: string; reference_field: string; tolerance: number }[]>([]);
function invalidate(side: Side) {
  side.revision++;
  side.fields = [];
  side.rules = [];
  side.loaded = false;
  side.error = '';
  comparisons.splice(0);
}
function message(err: any): string {
  const value = err?.response?.data?.message || err?.message || 'Không thể thực hiện yêu cầu';
  return Array.isArray(value) ? value.join('; ') : String(value);
}
async function discover(side: Side) {
  const revision = ++side.revision;
  side.loading = true;
  side.error = '';
  try {
    const res: any = await httpClient.get('/plugins/testing/autocheck/fields', { params: { itemCode: side.item_code.trim(), fwVersion: side.fw_version.trim() } });
    const data = res?.data || res;
    const fields = data.fields;
    if (!Array.isArray(fields)) throw new Error('API field discovery trả dữ liệu không hợp lệ');
    if (revision !== side.revision) return;
    side.fields = fields.map((field: any) => typeof field === 'string' ? field : field.field || field.name).filter((field: any) => typeof field === 'string');
    side.loaded = true;
  } catch (err) {
    if (revision === side.revision) side.error = message(err);
  } finally {
    side.loading = false;
  }
}
function criteria(side: Side) {
  if (!side.rules.length) throw new Error(`${side.label}: cần ít nhất một điều kiện`);
  return {
    item_code: side.item_code.trim(), fw_version: side.fw_version.trim(),
    rules: side.rules.map(rule => {
      if (!side.fields.includes(rule.field) || !Number.isInteger(rule.count) || rule.count < 1) throw new Error(`${side.label}: field hoặc count không hợp lệ`);
      const result: any = { field: rule.field, count: rule.count };
      if (rule.mode === 'equals') {
        result.equals = JSON.parse(rule.equals);
        if (result.equals !== null && !['string', 'number', 'boolean'].includes(typeof result.equals)) throw new Error('Giá trị bằng phải là số, chuỗi, boolean hoặc null');
      } else if (rule.mode === 'range') {
        if (rule.min !== '') result.min = Number(rule.min);
        if (rule.max !== '') result.max = Number(rule.max);
        if (result.min === undefined && result.max === undefined) throw new Error('Nhập ít nhất min hoặc max');
        if ((result.min !== undefined && !Number.isFinite(result.min)) || (result.max !== undefined && !Number.isFinite(result.max)) || result.min > result.max) throw new Error('Khoảng min/max không hợp lệ');
      }
      return result;
    }),
  };
}
async function save() {
  error.value = ''; notice.value = '';
  try {
    if (!name.value.trim()) throw new Error('Nhập tên AutoCheck');
    const rules: any = { dut: criteria(dut) };
    if (useReference.value) {
      rules.reference = criteria(reference);
      rules.comparisons = comparisons.map(comparison => {
        if (!dut.fields.includes(comparison.dut_field) || !reference.fields.includes(comparison.reference_field) || !Number.isFinite(comparison.tolerance) || comparison.tolerance < 0) throw new Error('Mapping so sánh hoặc sai số không hợp lệ');
        return { ...comparison };
      });
    }
    const payload = { name: name.value.trim(), itemCode: dut.item_code.trim(), fwVersion: dut.fw_version.trim(), referenceItemCode: useReference.value ? reference.item_code.trim() : null, referenceFwVersion: useReference.value ? reference.fw_version.trim() : null, criteria: rules };
    saving.value = true;
    const res: any = profileId.value
      ? await httpClient.put(`/plugins/testing/autocheck/profiles/${encodeURIComponent(profileId.value)}`, payload)
      : await httpClient.post('/plugins/testing/autocheck/profiles', payload);
    const data = res?.data || res;
    if (!data.id || !data.autocheckId) throw new Error('API chưa trả mã AutoCheck đã lưu');
    profileId.value = data.id;
    autocheckId.value = data.autocheckId;
    notice.value = 'Đã lưu cấu hình AutoCheck.';
  } catch (err) { error.value = message(err); }
  finally { saving.value = false; }
}
</script>
