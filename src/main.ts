import { Rive, ViewModelInstanceList } from "@rive-app/webgl2";

// --- 型 ---
interface Item {
  caption: string;
  L1: boolean;
  L2: boolean;
}

// --- DOM ---
const riveCanvas = document.getElementById("canvas") as HTMLCanvasElement;
const numberSelect = document.getElementById("numberSelect") as HTMLSelectElement | null;
const bool1 = document.getElementById("bool1") as HTMLSelectElement | null;
const bool2 = document.getElementById("bool2") as HTMLSelectElement | null;

// --- 状態 ---
let list: ViewModelInstanceList | null = null;

// --- ユーティリティ ---
function getStarList(index: number) {
  return list?.instanceAt(index)?.list("StarLIst") ?? null;
}

function syncBoolSelects(index: number) {
  const starList = getStarList(index);
  if (bool1) bool1.value = String(starList?.instanceAt(0)?.boolean("IsActive")?.value);
  if (bool2) bool2.value = String(starList?.instanceAt(1)?.boolean("IsActive")?.value);
}

const ARTBOARD_W = 410;
const ARTBOARD_H = 215;

function setupCanvas(rive: Rive) {
  const dpr = window.devicePixelRatio || 1;
  riveCanvas.width  = ARTBOARD_W * dpr;
  riveCanvas.height = ARTBOARD_H * dpr;
  riveCanvas.style.width  = `${ARTBOARD_W}px`;
  riveCanvas.style.height = `${ARTBOARD_H}px`;
  rive.resizeDrawingSurfaceToCanvas();
}

// --- イベントハンドラ ---
function onNumberChanged(e: Event) {
  const index = Number((e.target as HTMLSelectElement).value);
  syncBoolSelects(index);
}

function onL1Change(e: Event) {
  if (!numberSelect || !bool1) return;
  const starList = getStarList(Number(numberSelect.value));
  const target = starList?.instanceAt(0)?.boolean("IsActive");
  if (target) target.value = bool1.value === "true";
}

function onL2Change(e: Event) {
  if (!numberSelect || !bool2) return;
  const starList = getStarList(Number(numberSelect.value));
  const target = starList?.instanceAt(1)?.boolean("IsActive");
  if (target) target.value = bool2.value === "true";
}

// --- 初期化 ---
async function load() {
  const data = await fetch("list_item.json").then((r) => r.json()) as Item[];

  const rive = new Rive({
    src: "listtest.riv",
    canvas: riveCanvas,
    stateMachines: "State Machine 1",
    autoplay: true,

    onLoad: () => {
      setupCanvas(rive);

      const mainVM = rive.viewModelByName("MainVM");
      const listItemVM = rive.viewModelByName("ListItemVM");
      const mainInstance = mainVM?.defaultInstance();
      if (!mainInstance || !listItemVM) return;

      // スクロール監視
      const scrollPercentY = mainInstance.number("ScrollPercentY");
      scrollPercentY?.on(() => console.log(scrollPercentY.value));

      // リスト初期化
      const listProp = mainInstance.list("listProperty");
      if (!listProp) return;
      list = listProp;
      listProp.removeInstanceAt(0);

      // JSONデータからリストアイテムを生成
      for (const item of data) {
        const listItem = listItemVM.defaultInstance();
        if (!listItem) continue;

        const captionProp = listItem.string("Caption");
        if (captionProp) captionProp.value = item.caption;

        const starList = listItem.list("StarLIst");
        if (starList) {
          const lv1 = starList.instanceAt(0)?.boolean("IsActive");
          const lv2 = starList.instanceAt(1)?.boolean("IsActive");
          if (lv1) lv1.value = item.L1;
          if (lv2) lv2.value = item.L2;
        }

        listProp.addInstance(listItem);
      }

      rive.bindViewModelInstance(mainInstance);

      // ロード時に index 0 の値で bool1/bool2 を初期化
      syncBoolSelects(0);
    },
  });
}

// --- イベント登録 ---
numberSelect?.addEventListener("change", onNumberChanged);
bool1?.addEventListener("change", onL1Change);
bool2?.addEventListener("change", onL2Change);

load();