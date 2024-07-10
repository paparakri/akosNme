import {
    ChakraProvider,
    FormControl,
    FormErrorMessage,
    FormHelperText,
    FormLabel,
    Input,
    extendTheme,
    Box
  } from "@chakra-ui/react";
import { SetStateAction, useState } from "react";

const activeLabelStyles = {
  transform: "scale(0.85) translateY(-24px)"
};

export const theme = extendTheme({
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles
              }
            },
            "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label": {
              ...activeLabelStyles
            },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: "absolute",
              backgroundColor: "white",
              pointerEvents: "none",
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: "left top"
            }
          }
        }
      }
    }
  }
});

const FloatingInput = ({inputLabel, setInputLabel} : {inputLabel:string, setInputLabel:any}) => {
    const handleChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setInputLabel(e.target.value);
    }

    return(
        <>
            <FormControl variant='floating'>
                <Input value={inputLabel} id="input" onChange={handleChange}/>
                {/* It is important that the Label comes after the Control due to css selectors */}
                <FormErrorMessage>Invalid Input</FormErrorMessage>
            </FormControl>
        </>
    );
};

export default FloatingInput;