import CRForm from '@/components/form/CRForm';
import CRInput from '@/components/form/CRInput';
import CRInputNumber from '@/components/form/CRInputNumber';
import CRSelect from '@/components/form/CRSelect';
import CRTextarea from '@/components/form/CRTextarea';
import CARButton from '@/components/ui/CARButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IModalProps } from '@/interface/interface';
import { useUpdateServiceMutation } from '@/redux/features/services/servicesApi';
import { Image } from 'antd';
import { FC } from 'react';
import { toast } from 'sonner';



const serviceLevel = [
  {
    value: 'Standard',
    label: 'Standard',
  },
  {
    value: 'Premium',
    label: 'Premium',
  },
  {
    value: 'Deluxe',
    label: 'Deluxe',
  },
  {
    value: 'Express',
    label: 'Express',
  },
  {
    value: 'Eco-Friendly',
    label: 'Eco-Friendly',
  },
];

const EditModal:FC<IModalProps> = ({ isOpen, onClose, data }) => {
  const [updateService] = useUpdateServiceMutation();

  const handleEditDataSubmit = async (formData:any) => {
    const toastId = toast.loading('Service Updating..');
    const newData = data?._id || data?.id;

    if (!newData) {
      toast.error('Service id is missing', { id: toastId, duration: 2000 });
      return;
    }

    const update = {
      ...formData,
      id: newData,
      _id: newData,
      price: Number(formData.price),
      duration: Number(formData.duration),
    };

    const res = await updateService(update);

    if (res?.data?.success) {
      toast.success('Service info updated successfully', {
        id: toastId,
        duration: 2000,
      });
      onClose();
    } else {
      const errorMessage =
        typeof res?.error === 'object' && res.error && 'data' in res.error
          ? (res.error as { data?: { message?: string } }).data?.message
          : 'Unable to update service';

      toast.error(errorMessage || 'Unable to update service', {
        id: toastId,
        duration: 2000,
      });
    }
  };



  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white min-w-[50vw]">
          <DialogHeader>
            <DialogTitle>Edit service information</DialogTitle>
            <DialogDescription>
              <CRForm onSubmit={handleEditDataSubmit}>
                <div className="">
                  <CRInput
                    type="text"
                    label="Service Title"
                    name="name"
                    className="w-full"
                    defaultValue={data?.name}
                  />
                              </div>

                <div className="flex items-center gap-4">
                  <div className="w-full">
                    <CRInput
                      type="text"
                      className="w-full"
                      label="Service Image Url"
                      name="images"
                      defaultValue={data?.images}
                    />
                    <div className="flex gap-4">
                      <CRInputNumber
                        type="number"
                        className="w-full"
                        label="Price"
                        name="price"
                        defaultValue={data?.price}
                      />
                      <CRInputNumber
                        type="number"
                        className="w-full"
                        label="Duration"
                        name="duration"
                        defaultValue={data?.duration}
                      />
                    </div>
                    <div className="flex gap-4">
                      <CRSelect
                        className="w-full"
                        label="Category"
                        name="serviceLevel"
                        options={serviceLevel}
                        defaultValue={data?.serviceLevel}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <Image
                      className="max-w-fit rounded-md"
                      src={data?.images}
                    />
                  </div>
                </div>
                <CRTextarea
                  type="text"
                  label="Description"
                  name="description"
                  defaultValue={data?.description}
                />

                <CARButton text="Update" htmlType="submit" />
              </CRForm>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditModal;
