// import "./style.css";
import { Rive } from "@rive-app/webgl2";
interface Item {
  caption: string;
  L1: boolean;
  L2: boolean;
}


onLoad: () => {
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = riveCanvas.getBoundingClientRect();

    riveCanvas.width = rect.width * dpr;
    riveCanvas.height = rect.height * dpr;

    rive.resizeDrawingSurfaceToCanvas();
  };

  resize();
  window.addEventListener("resize", resize);

}

const riveCanvas = document.getElementById("canvas") as HTMLCanvasElement;

const load = async () => {
  const [data] = await Promise.all([
    fetch("list_item.json").then((r) => r.json()) as Promise<Item[]>,
  ]);

  const rive = new Rive({
  src: "listtest.riv",
  canvas: riveCanvas,
  stateMachines: "State Machine 1",
  autoplay: true,

  onLoad: () => {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = riveCanvas.getBoundingClientRect();

      riveCanvas.width = rect.width * dpr;
      riveCanvas.height = rect.height * dpr;

      rive.resizeDrawingSurfaceToCanvas();
    };

    resize();
    window.addEventListener("resize", resize);

    // ===== あなたの既存処理 =====

    const mainVM = rive.viewModelByName("MainVM");
    const listItemVM = rive.viewModelByName("LIstItemVM");
    if (!mainVM || !listItemVM) return;

    const mainInstance = mainVM.defaultInstance();
    if (!mainInstance) return;

    const listProp = mainInstance.list("listProperty");
    if (!listProp) return;

    listProp.removeInstanceAt(0);

    data.forEach((item) => {
      const listItem = listItemVM.defaultInstance();
      if (!listItem) return;

      const captionProp = listItem.string("Caption");
      if (captionProp) {
        captionProp.value = item.caption;
      }

      const starList = listItem.list("StarLIst");
      if (starList) {
        const lv1 = starList.instanceAt(0)?.boolean("IsActive");
        const lv2 = starList.instanceAt(1)?.boolean("IsActive");

        if (lv1 && lv2) {
          lv1.value = item.L1;
          lv2.value = item.L2;
        }
      }

      listProp.addInstance(listItem);
    });

    rive.bindViewModelInstance(mainInstance);
  },
});
};

load();
