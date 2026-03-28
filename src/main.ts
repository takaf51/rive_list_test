import "./style.css";
import { Rive } from "@rive-app/webgl2";
interface Item {
  caption: string;
  L1: boolean;
  L2: boolean;
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
    // autoBind: true, // 動的にリストを組む場合は、手動バインドの方が制御しやすいです
    onLoad: () => {
      // 1. テンプレート（定義）の取得
      const mainVM = rive.viewModelByName("MainVM");
      const listItemVM = rive.viewModelByName("LIstItemVM");
      if (!mainVM || !listItemVM) return;

      // 2. 実際に使う「インスタンス」をメモリ上に作成
      const mainInstance = mainVM.defaultInstance();
      if (!mainInstance) return;
      const listProp = mainInstance.list("listProperty");
      if (!listProp) return;
      // 3. 既存のダミーデータを削除（必要に応じて）
      while (listProp.length > 0) {
        listProp.removeInstance(0);
      }

      // // 4. データをループして子要素を作成・追加
      // data.forEach((item) => {
      //   const listItem = listItemVM.defaultInstance();
      //   if (!listItem) return;
      //   // Captionプロパティへの代入（型の確認を忘れずに）
      //   const captionProp = listItem.string("Caption");
      //   if (captionProp) {
      //     captionProp.value = item.caption;
      //   }

      //   // 親のリストプロパティに追加
      //   listProp.addInstance(listItem);
      // });

      // // 【最重要】作成したインスタンスをRiveにバインドする
      // // これを呼んだ瞬間にUIが更新されます
      // rive.bindViewModelInstance(mainInstance);

      console.log("List updated with", listProp.length, "items.");
    },
  });
};

load();
