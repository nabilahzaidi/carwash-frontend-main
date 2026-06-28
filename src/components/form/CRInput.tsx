import { Form, Input } from 'antd';
import { Controller } from 'react-hook-form';

type TInputProps = {
  type: string;
  name: string;
  label?: string;
  disabled?: boolean;
  className?:string;
  placeholder?:string;
  size?:string;
  defaultValue?:string;
  readonly?:boolean;
};

const CRInput = ({ type, name,readonly, label, disabled,className,placeholder,defaultValue }: TInputProps) => {
  return (
    <div className={className}>
      <Controller
        name={name}
        
        defaultValue={defaultValue}
        render={({ field }) => (
          <Form.Item label={<span className="text-white">{label}</span>}>
            <Input
              {...field}
              type={type}
              id={name}
              placeholder={placeholder}
              size="large"
              disabled={disabled}
              readOnly={readonly}
              className="bg-slate-900/80 text-white placeholder:text-slate-300 border border-slate-700"
            />
          </Form.Item>
        )}
      />
    </div>
  );
};

export default CRInput;
