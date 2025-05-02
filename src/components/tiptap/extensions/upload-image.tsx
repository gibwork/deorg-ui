import { EditorView } from "@tiptap/pm/view";
import { findPlaceholder, Placeholder } from "../plugins/placeholder";
import { uploadFile } from "@/actions/post/upload-image";
import { toast } from "sonner";

export async function uploadImg(file: File, view: EditorView) {
  let id = {};
  let tr = view.state.tr;
  if (!tr.selection.empty) tr.deleteSelection();
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    tr.setMeta(Placeholder, {
      add: {
        id,
        pos: view.state.selection.from,
        src: reader.result,
      },
    });
    view.dispatch(tr);
  };

  if (!file.type.includes("image/")) {
    return;
  } else if (file.size / 1024 / 1024 > 20) {
    return;
  }

  toast.loading("Uploading image...");

  const formData = new FormData();

  formData.append("images", file);

  const { error, success: url } = await uploadFile(formData);

  if (error) {
    toast.dismiss();
    return toast.error("Something went wrong.", {
      description: error.message,
    });
  }

  toast.success("Uploaded.");
  toast.dismiss();
  let pos = findPlaceholder(view.state, id);
  if (pos == null) return;

  view.dispatch(
    view.state.tr
      .replaceWith(
        pos,
        pos,
        view?.state?.schema?.nodes?.image!.create({
          src: url,
        })
      )
      .setMeta(Placeholder, { remove: { id } })
  );
}

export function handleImagePaste(view: EditorView, event: ClipboardEvent) {
  if (event.clipboardData?.files.length) {
    event.preventDefault();
    const file = event.clipboardData.files[0];
    if (file) uploadImg(file, view);
    return true;
  }
  return false;
}
