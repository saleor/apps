import { InputAdornment, TextField } from "@material-ui/core";
import { SearchIcon } from "@saleor/macaw-ui";
import { ChangeEvent } from "react";
import { useSearchBox } from "react-instantsearch-hooks-web";
import styles from "../styles/search.module.css";

export function SearchBox() {
  const { query, refine } = useSearchBox();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    refine(e.target.value);
  };

  return (
    <div className={styles.textFieldContainer}>
      <TextField
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        value={query}
        onChange={handleChange}
        placeholder={"Search products..."}
        inputProps={{ style: { padding: "16px" } }}
        className={styles.textField}
      />
    </div>
  );
}
