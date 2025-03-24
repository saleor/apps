# React Hook Form Macaw

Package contains ready to use bindings to use Macaw with the React Hook Library.

To use it with forms, pass `control` object to the input as in example:

```tsx
import { Input } from "@saleor/react-hook-form-macaw";
const { control } = useForm();
<Input control={control} label="Input field" name="name" />;
```

Components will respect default values and error states set by the RHF.
