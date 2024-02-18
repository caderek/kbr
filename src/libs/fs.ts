window.addEventListener("contextmenu", async () => {
  const handle = await window.showDirectoryPicker({
    mode: "readwrite",
  })
  console.log(handle)

  for await (const [key, value] of handle.entries()) {
    console.log({ key, value })
  }
})
