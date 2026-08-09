import { Modal } from "@mantine/core";
import { useEffect } from "react";



function AppModal({
  opened,
  onClose,
  title,
  children,
  size = "lg",
}:any) {
  useEffect(() => {
  console.log("opened:", opened);
}, [opened]);
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      closeOnClickOutside={true}
    >
      {children}
    </Modal>
  );
}

export default AppModal;