import CRForm from '@/components/form/CRForm';
import CRInput from '@/components/form/CRInput';

import CRInputNumber from '@/components/form/CRInputNumber';
import CRSelect from '@/components/form/CRSelect';
import CRTextarea from '@/components/form/CRTextarea';
import CARButton from '@/components/ui/CARButton';
import { useAddServiceMutation } from '@/redux/features/services/servicesApi';
import { toast } from 'sonner';

import {  Minimize2Icon } from 'lucide-react';
import { FC } from 'react';
import { IModalProps } from '@/interface/interface';


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

const vehicleTypes = [
  {
    value: 'Small Car',
    label: 'Small Car',
  },
  {
    value: 'Medium Car',
    label: 'Medium Car',
  },
  {
    value: 'SUV',
    label: 'SUV',
  },
  {
    value: 'MPV',
    label: 'MPV',
  },
  {
    value: 'Van/Truck',
    label: 'Van/Truck',
  },
];


const AddNewService: FC<IModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
   const [addService]= useAddServiceMutation()



  const handleEditDataSubmit = async (data: any) => {
    const toastId = toast.loading('Service Creating....');
    const payload = {
      ...data,
      price: Number(data.price),
      duration: Number(data.duration),
      serviceLevel: data.serviceLevel || 'Standard',
    };

    try {
      const res = await addService(payload).unwrap();
      toast.success(res.message || 'Service created successfully', {
        id: toastId,
        duration: 2000,
      });
      onClose();
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.error || 'Service creation failed';
      toast.error(errorMessage, {
        id: toastId,
        duration: 3000,
      });
    }
  };

  return (
  
       <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
      
    >
      <button className='absolute text-2xl text-white top-6 right-10' onClick={onClose}>X</button>
       <div className="relative bg-white p-20 rounded shadow-lg max-w-full max-h-full">
       <div>
       <h3 className="text-2xl font-bold">Add New Service</h3> 
       <button className='absolute text-2xl text-primary top-4 right-4' onClick={onClose}><Minimize2Icon/></button>
       </div>
 
       <div className='flex  justify-between'>
       <CRForm onSubmit={handleEditDataSubmit}>
         <div className="flex items-center  justify-between gap-4">
           <CRInput
             type="text"
             label="Service Title"
             name="name"
             className="w-full"
           />
         </div>
         <div className="flex gap-6 items-center justify-between">
           <CRInput
             type="text"
             className="w-full"
             label="Image Link"
             name="images"
           />
     
           <CRSelect
             className="w-full sticky z-50"
             label="Category"
             name="serviceLevel"
             options={serviceLevel}
           />

           <CRSelect
             className="w-full sticky z-50"
             label="Vehicle Type"
             name="vehicleType"
             options={vehicleTypes}
           />
           {/* <Image className="max-w-40 rounded-md" src={data?.images}/> */}
         </div>
 
         <div className="flex gap-4">
         <CRInputNumber
                         type="number"
                         className="w-full"
                         label="Price"
                         name="price"
                       />
                       <CRInputNumber
                         type="number"
                         className="w-full"
                         label="Duration"
                         name="duration"
                        
                       />
         </div>
         <CRTextarea type="text" label="Description" name="description" />
 
         <CARButton text="Add New Service" htmlType="submit" />
       </CRForm>
  
       </div>
   
     </div>
  </div>
  );
};

export default AddNewService;
