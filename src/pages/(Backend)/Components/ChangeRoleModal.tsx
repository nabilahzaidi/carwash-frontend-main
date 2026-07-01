
import CARButton from '@/components/ui/CARButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IModalProps } from '@/interface/interface';
import { useUpdateUserRoleMutation } from '@/redux/features/auths/authApi';
import { Input } from 'antd';
import { FC, useState } from 'react';
import { toast } from 'sonner';



const ChangeRoleModal: FC<IModalProps> = ({ isOpen, onClose, data }) => {
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [selectedStatus, setSelectedStatus] = useState(data?.status || 'active');

  const handleEditDataSubmit = async (e: any) => {
    e.preventDefault();

    const newRole = e.target.role.value;
    const userInfo = {
      role: newRole,
      status: selectedStatus,
      userId: data._id,
    };
    const res = await updateUserRole(userInfo);
    if (res?.data?.success) {
      toast.success(res?.data?.message, { duration: 2000 });
      onClose();
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white  min-w-[30vw]">
          <DialogHeader>
            <DialogTitle>Change user role and status</DialogTitle>
            <DialogDescription>
              <form
                onSubmit={(e) => handleEditDataSubmit(e)}
                className="space-y-4"
                action=""
              >
                <div className="flex flex-col text-primary gap-4 my-10">
                  <div className="w-full">
                    <label htmlFor="">User Name</label>
                    <Input
                      type="text"
                      name="name"
                      disabled
                      className="w-full"
                      defaultValue={data?.name}
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="">Role</label>
                    <select
                      defaultValue={data?.role}
                      name="role"
                      className="w-full border p-2 px-4 rounded"
                    >
                      <option value="admin">admin</option>
                      <option value="user">user</option>
                      <option value="staff">staff</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <label htmlFor="">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border p-2 px-4 rounded"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <CARButton text="Update Role & Status" />
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChangeRoleModal;
