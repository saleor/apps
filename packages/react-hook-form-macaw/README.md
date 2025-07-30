# React Hook Form Macaw

This package contains ready-to-use bindings to use Macaw with the React Hook Form library.

To use it with forms, pass the `control` object to the input as in the example:

```tsx
import { Input } from "@saleor/react-hook-form-macaw";
const { control } = useForm();
<Input control={control} label="Input field" name="name" />;
```

Components will respect default values and error states set by RHF.
