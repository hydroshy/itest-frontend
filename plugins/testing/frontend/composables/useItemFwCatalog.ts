import { ref } from 'vue';
import { httpClient } from '@/api/client';

const itemCodes = ref<string[]>([]);
const fwByItemCode = ref<Record<string, string[]>>({});
const allFwVersions = ref<string[]>([]);
const loaded = ref(false);
const loading = ref(false);

export function useItemFwCatalog() {
  async function loadCatalog(force = false) {
    if (loaded.value && !force) return;
    loading.value = true;
    try {
      const codeSet = new Set<string>();
      const fwMap: Record<string, Set<string>> = {};
      const allFwSet = new Set<string>();

      const addEntry = (item?: string, fw?: string) => {
        const cItem = (item || '').trim().toUpperCase();
        const cFw = (fw || '').trim().toUpperCase();
        if (cItem) {
          codeSet.add(cItem);
          if (!fwMap[cItem]) fwMap[cItem] = new Set<string>();
          if (cFw) {
            fwMap[cItem].add(cFw);
            allFwSet.add(cFw);
          }
        } else if (cFw) {
          allFwSet.add(cFw);
        }
      };

      // 1. Từ memmap profiles
      try {
        const resMemmap: any = await httpClient.get('/plugins/memmap-manager/profiles').catch(() => null);
        const mItems = resMemmap?.data?.items || resMemmap?.data || (Array.isArray(resMemmap) ? resMemmap : []);
        if (Array.isArray(mItems)) {
          mItems.forEach((m: any) => {
            addEntry(m.itemCode || m.item_code || m.sku, m.fwVersion || m.fw_version || m.longFw || m.long_fw);
          });
        }
      } catch {}

      // 2. Từ simulation profiles
      try {
        const resFlows: any = await httpClient.get('/plugins/testing/simulation/profiles').catch(() => null);
        const fItems = resFlows?.data?.items || resFlows?.data || (Array.isArray(resFlows) ? resFlows : []);
        if (Array.isArray(fItems)) {
          fItems.forEach((f: any) => {
            addEntry(f.itemCode || f.item_code || f.sku, f.fwVersion || f.longFw || f.long_fw);
          });
        }
      } catch {}

      // 3. Từ test batches
      try {
        const resBatches: any = await httpClient.get('/plugins/testing/test-batches').catch(() => null);
        const bItems = resBatches?.data?.items || resBatches?.data || (Array.isArray(resBatches) ? resBatches : []);
        if (Array.isArray(bItems)) {
          bItems.forEach((b: any) => {
            addEntry(b.itemCode || b.item_code, b.fwVersion || b.longFw || b.long_fw);
          });
        }
      } catch {}

      // 4. Từ testing lookup items
      try {
        const resLookup: any = await httpClient.get('/plugins/testing/lookup/items').catch(() => null);
        const lItems = resLookup?.data?.items || resLookup?.data || (Array.isArray(resLookup) ? resLookup : []);
        if (Array.isArray(lItems)) {
          lItems.forEach((l: any) => {
            addEntry(l.itemCode || l.item_code);
          });
        }
      } catch {}

      // 5. Từ decoder scripts
      try {
        const resScripts: any = await httpClient.get('/plugins/decoder/scripts').catch(() => null);
        const sItems = resScripts?.data?.items || resScripts?.data || (Array.isArray(resScripts) ? resScripts : []);
        if (Array.isArray(sItems)) {
          sItems.forEach((s: any) => {
            addEntry(s.itemCode || s.sku, s.longFw || s.fwCode);
          });
        }
      } catch {}

      const mappedFw: Record<string, string[]> = {};
      for (const [c, set] of Object.entries(fwMap)) {
        mappedFw[c] = Array.from(set).sort();
      }

      itemCodes.value = Array.from(codeSet).sort();
      fwByItemCode.value = mappedFw;
      allFwVersions.value = Array.from(allFwSet).sort();
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  function getFwListForItem(itemCode: string): string[] {
    const clean = (itemCode || '').trim().toUpperCase();
    if (clean && fwByItemCode.value[clean] && fwByItemCode.value[clean].length > 0) {
      return fwByItemCode.value[clean];
    }
    return allFwVersions.value;
  }

  return {
    itemCodes,
    fwByItemCode,
    allFwVersions,
    loaded,
    loading,
    loadCatalog,
    getFwListForItem,
  };
}
