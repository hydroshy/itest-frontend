import { ref } from 'vue';

const isTransitioning = ref(false);
const targetNode = ref('SYS_CORE');
const asciiStatus = ref('ACCESSING_NODE');
const glitchLines = ref<string[]>([]);

let timer: ReturnType<typeof setTimeout> | null = null;

export function useCtosTransition() {
  function triggerTransition(target = 'SYS_CORE', status = 'BREACHING_SECTOR') {
    targetNode.value = target.toUpperCase();
    asciiStatus.value = status.toUpperCase();
    
    // Generate random ctOS style memory address and hex tokens
    const hex1 = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const hex2 = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const port = Math.floor(Math.random() * 9000 + 1000);
    
    glitchLines.value = [
      `0x${hex1} :: SEC_NET_ESTABLISHED -> PORT [${port}]`,
      `STREAM_DECODE: >> 0x${hex2} [ctOS_KERNEL_OK]`,
      `MOUNTING_SUBSYSTEM -> ${target.toUpperCase()}`
    ];

    isTransitioning.value = true;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      isTransitioning.value = false;
    }, 480);
  }

  return {
    isTransitioning,
    targetNode,
    asciiStatus,
    glitchLines,
    triggerTransition,
  };
}
