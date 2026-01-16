import { useCallback, useEffect, useRef, useState } from "react";
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Button, Typography, Grid2, SelectChangeEvent, CircularProgress, IconButton, OutlinedInput, InputAdornment, Paper, Link, Divider } from "@mui/material";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import myAxios from "./../api";
import { AxiosError, AxiosResponse } from "axios";
import { FIRE, HEADER_FIRE, Response, START_LOADER } from "../Layout.Interface";
import { Link as RLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface body {
  id: number;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  mobile: number | string;
  isactive: boolean;
  type: string;
  name: string;
}

export type MemType = "STAFF" | "ADMIN";

const initialBody: body = {
  id: 0,
  email: "",
  password: "",
  firstname: "",
  lastname: "",
  mobile: "",
  name: "",
  isactive: false,
  type: '-1',
};

const initialError = {
  email: "",
  password: "",
  firstname: "",
  type: "",
};

const UserForm = () => {
  const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const handleNavigate = useCallback((arg0: string): undefined => {
    navigate(arg0)
  }, []);
  const memTypeData: MemType[] = ["ADMIN", "STAFF"];

  const [sendBody, setSendBody] = useState<body>(initialBody);
  const [bodyError, setBodyError] = useState(initialError);
  const [saveLoader, setSaveLoader] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { userId } = useParams<{ userId: string | undefined }>();

  useEffect(() => {
    if (userId) {
      getUser();
    }

    setUpHeader({
      title: userId ? "Edit user" : "Create user",
      sub_title: `Kindly ensure all required fields are completed to ${userId ? 'edit a user' : 'create a new user'}.`,
      breadcrum: () => [
        <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>,

        <Link key={1} component={RLink} underline="hover" color="inherit" to="/users">
          User
        </Link>,
        <Typography key={2} >{userId ? "Update" : "Create"}</Typography>,
      ],
    });

    return () =>
      setUpHeader({
        title: "",
        sub_title: "",
        breadcrum() {
          return [];
        },
      });
  }, [userId]);

  const getUser = async () => {
    startLoader(true)
    try {
      const req = await myAxios.get(`/User/AllUsers?id=${userId}&pageNumber=0&recordPerPage=0&showAll=true`);
      if (req.status === 200) {
        const { data, status }: Response<body[]> = req.data;
        if (status === "Success") {
          if (typeof data !== "undefined") {
            setSendBody({ ...data[0], firstname: `${data[0]['name'].split(" ")[0]}`, lastname: `${data[0]['name'].split(" ")[1] ?? ""}` });
          }
        }
      }
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.log(_err.message);
      } else {
        console.log("An unexpected error occurred");
      }
    }
    startLoader(false)
  };

  const handleChangeInput = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ): void => {
    const { name, value, type } = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement;
    const checked = (e.target as HTMLInputElement).checked;

    if ((name === "mobile") && value.length > 10) {
      return;
    }

    setSendBody((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));

    setBodyError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateInput = () => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

    const errors: typeof bodyError = {
      email: "",
      password: "",
      firstname: "",
      type: "",
    };

    Object.keys(errors).forEach((key) => {
      const fieldKey = key as keyof typeof bodyError;

      if (!sendBody[fieldKey]) {
        errors[fieldKey] = `${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)} is required`;
      }
    });

    if (sendBody.email && !emailRegex.test(sendBody.email)) {
      errors.email = "Email is not valid";
    }

    if (sendBody.password) {
      if (!passwordRegex.test(sendBody.password)) {
        errors.password =
          "Password must have 8-16 characters, including a capital letter, number, and special character.";
      } else if (sendBody.password.length < 8) {
        errors.password = "Password must be at least 8 characters long.";
      }

    }
    if (userId) {
      errors.password = ""
    }
    // if (sendBody.mobile && sendBody.mobile.toString().length !== 10) {
    //   errors.mobile = "Mobile number must be 10 digits long.";
    // }

    if (sendBody.type && sendBody.type === '-1') {
      errors.type = "Member Type is required";
    }

    setBodyError(errors); 
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async () => {

    if (validateInput() === false) return;
    startLoader(true)

    if (timerRef?.current != null) {
      clearTimeout(timerRef.current);
    }
    setSaveLoader(true);
    let response: AxiosResponse<any, any>;
    response = await myAxios.post(`/User/Saveuser`, { ...sendBody, name: sendBody.firstname + ` ${sendBody.lastname}` });
    try {
      if (response.data.status === "Success") {
        startFir({
          msg: "User save successfully",
          type: "S"
        })
        handleNavigate("/users")
      } else {
        startFir({
          msg: "Unable to save user",
          type: "W"
        })
      }
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.log(_err.message);
      } else {
        console.log("An unexpected error occurred");
      }
    }
    startLoader(true)
  };

  const handleResetButton = () => {
    if (userId) {
      setSendBody(initialBody);
      setBodyError(initialError);
    } else {
      setSendBody(initialBody);
      setBodyError(initialError);
    }
  };

  return (
    <Paper sx={{ borderRadius: 1, boxShadow: 2, }}>
      <Box display="flex" justifyContent="space-between" alignItems={"center"} paddingY={1} paddingX={2}>
        <Typography variant="h5" align="left" >
          {userId ? "Edit User" : "Create User"}
        </Typography>
        <Box display={"flex"} alignItems={"center"} gap={1} >
          {userId && (
            <Grid2>
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="small"
                sx={{ width: "100%", textWrap: "nowrap" }}
                onClick={() => {
                  navigate("/user/form");
                  setSendBody(initialBody);
                  setBodyError(initialError);
                }}
              >
                New User
              </Button>
            </Grid2>
          )}
          <Grid2>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: "100%", textWrap: "nowrap" }}
              onClick={() => navigate("/users")}
            >
              User List
            </Button>
          </Grid2>
        </Box>
      </Box>
      <Divider />
      <Box padding={2} sx={{
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
        <Grid2 container spacing={{ xs: 2, md: 4 }}>
          <Grid2 size={{ xs: 12, md: 6 }} container display="flex" flexDirection="column" gap={0}>
            <TextField
              label="First Name"
              name="firstname"
              value={sendBody.firstname}
              onChange={handleChangeInput}
              required
              size="small"
              sx={{ width: "99%" }}
            />
            {bodyError.firstname && (
              <Typography
                variant="button"
                // gutterBottom
                sx={{ display: "block", textAlign: "right", color: "red" }}
              >
                {bodyError.firstname}
              </Typography>
            )}
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }} container>
            <TextField
              label="Last Name"
              name="lastname"
              value={sendBody.lastname}
              onChange={handleChangeInput}
              size="small"
              sx={{ width: "99%" }}
            />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={{ xs: 2, md: 4 }}>
          <Grid2 size={{ xs: 12, md: 6 }} container display="flex" flexDirection="column" gap={0}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={sendBody.email}
              onChange={handleChangeInput}
              size="small"
              sx={{ width: "99%" }}
              required
              autoCorrect="off"
            />
            {bodyError.email && (
              <Typography
                variant="button"
                // gutterBottom
                sx={{ display: "block", textAlign: "right", color: "red" }}
              >
                {bodyError.email}
              </Typography>
            )}
          </Grid2>

          {!userId && <Grid2 size={{ xs: 12, md: 6 }} container display="flex" flexDirection="column" gap={0}>

            <FormControl variant="outlined" size="small" fullWidth required>
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                label="Password"
                name="password"
                type={showPassword ? "type" : "password"}
                value={sendBody.password}
                onChange={handleChangeInput}
                size="small"
                sx={{ width: "99%" }}
                required
                autoComplete="new-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
              /></FormControl>
            {bodyError.password && (
              <Typography
                variant="button"
                // gutterBottom
                sx={{ display: "block", textAlign: "right", color: "red" }}
              >
                {bodyError.password}
              </Typography>
            )}
          </Grid2>}

          <Grid2 size={{ xs: 12, md: 6 }} container display="flex" flexDirection="column" gap={0}>
            <FormControl size="small" sx={{ width: "99%" }}>
              <InputLabel>Member Type *</InputLabel>
              <Select
                name="type"
                value={sendBody.type}
                onChange={(e) =>
                  handleChangeInput(e as SelectChangeEvent<string>)
                }
                required
                // placeholder="Member Type"
                label="Member Type"
              >
                <MenuItem selected value={'-1'}>Select Member Type</MenuItem>
                {memTypeData.map((mem) => (
                  <MenuItem key={mem} value={`${mem}`}>
                    {mem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {bodyError.type && (
              <Typography
                variant="button"
                // gutterBottom
                sx={{ display: "block", textAlign: "right", color: "red" }}
              >
                {bodyError.type}
              </Typography>
            )}
          </Grid2>
        </Grid2>

        <Grid2 container>
          <Grid2 size={{ xs: 12, md: 6 }} container>
            <FormControlLabel
              control={
                <Checkbox
                  name="isactive"
                  checked={sendBody.isactive}
                  onChange={handleChangeInput}
                  size="small"
                />
              }
              label="Active"
            />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={{ xs: 2, md: 1 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"

            onClick={handleSubmit}
          >
            {saveLoader ? (
              <CircularProgress size="23px" sx={{ color: "white" }} />
            ) : (
              "Submit"
            )}
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: "#f44336" }}
            size="small"
            onClick={handleResetButton}
          >
            Reset
          </Button>
        </Grid2>
      </Box>


    </Paper>
  );
};

export default UserForm;
