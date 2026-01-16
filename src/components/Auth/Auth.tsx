import OTP from "./OTP";
import myAxios from "./../api";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NoEncryptionGmailerrorredIcon from "@mui/icons-material/NoEncryptionGmailerrorred";
import { Avatar, Box, Button, Container, CssBaseline, TextField, Typography, Paper, Link, CircularProgress, Snackbar, IconButton } from "@mui/material";
import { AxiosError } from "axios";

interface SendBody {
  email: string;
  password: string;
}

interface ErrorHandle {
  emptyEmail: string;
  emptyPassword: string;
  invalidUser: string;
}

const initialBody: SendBody = { email: "", password: "" };
const initialError: ErrorHandle = {
  emptyEmail: "",
  emptyPassword: "",
  invalidUser: "",
};

const flipContainerStyle = {
  perspective: "1000px",
  position: "relative",
  width: "100%",
  height: "100%",
};

const flipCardStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  transition: "transform 0.6s",
};


function Auth(): JSX.Element {

  const [sendBody, setSendBody] = useState<SendBody>(initialBody);
  const [errorHandling, setErrorHandling] = useState<ErrorHandle>(initialError);
  const [loginLoader, setLoginLoader] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [flipCard, setFlipCard] = useState<boolean>(false);
  const [otp, setOtp] = useState("");
  const [isValid, setIsValid] = useState<String>("");
  const [isOptValid, setIsOtpValid] = useState<boolean>(false);
  const [otpSendSucc, setOtpSendSucc] = useState<boolean>(false);

  const [otpTimmer, setOtpTimmer] = useState<number>(0);
  const [resendOTP, setResendOTP] = useState<boolean>(true);
  const [timeoutOTP, setTimeoutOTP] = useState<boolean>(false);


  const navigate = useNavigate();

  const flippedStyle = {
    transform: "rotateY(180deg)",
  };



  useEffect(() => {
    const intreval = setInterval(() => {
      setOtpTimmer((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000)

    setTimeout(() => {
      setResendOTP(true);
      setIsValid("");
    }, 60000)

    return () => {
      clearInterval(intreval);
    };

  }, [timeoutOTP])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setSendBody((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorHandling(initialError);
  };

  const loginHandler = async (): Promise<void> => {
    if (sendBody.email === "") {
      setErrorHandling((prev) => ({
        ...prev,
        emptyEmail: "EMPTY",
      }));
      return;
    } else if (sendBody.password == "") {
      setErrorHandling((prev) => ({
        ...prev,
        emptyPassword: "EMPTY",
      }));
      return;
    }

    setLoginLoader(true);
    try {
      const response = await myAxios.post(`/User/login`, { email: sendBody.email, password: sendBody.password });
      if (response.data.status === "Success") {
        setSnackbarOpen(true);
        const data = response.data.data[0];
        if (data.isactive === false) {
          setErrorHandling((prev) => ({
            ...prev,
            invalidUser: "INACTIVE",
          }));
        }
        else {
          localStorage.setItem("@Name", data.name);
          localStorage.setItem("@User", data.email);
          localStorage.setItem("@Type", data.type);
          localStorage.setItem("@Id", data.id);
          // Object.entries(data).forEach((obj) => {
          //   const [key, value]: [string, unknown] = obj;
          //   localStorage.setItem(key, value as string);
          // });
          setErrorHandling(initialError);
          navigate("/")
        }
      } else {
        setErrorHandling((prev) => ({
          ...prev,
          invalidUser: "INVALID",
        }));
      }
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.log(_err.message);
      } else {
        console.log("An unexpected error occurred");
      }
      setErrorHandling((prev) => ({
        ...prev,
        invalidUser: "SERVER",
      }));
    }
    setLoginLoader(false);
  };

 

  const verifyEmail = async () => {

    let res = await myAxios.get(`User/ValidateOtp?Email=${sendBody.email}&OTP&otptype&validatetype=Email`);


    if (res.data.status === 'EMAILVALID') {
      setIsValid(res.data.status);
      sendOTP();
    } else if (res.data.status === 'EMAILINVALID') {

      setIsValid(res.data.status);
    }
 
  }

  const sendOTP = async () => {
    setOtpSendSucc(true);
    setOtpTimmer(60);
    setTimeoutOTP((prev) => !prev);
    setResendOTP(false);
    // let res=await myAxios.post(`User/SendOtp?email=${sendBody.email}&otptype=CHNPWD`)
    // if(res.data.status==='Success'){
    //   // setOtpSendSucc(true);
    //   // setOtpTimmer(5);
    //   setOtpSendSucc(true);
    //   setOtpTimmer(60);
    //   setTimeoutOTP((prev)=>!prev);
    // }else{

    // }

  }

  const saveOTP = async () => {
    let res = await myAxios.get(`User/ValidateOtp?Email=${sendBody.email}&OTP=${otp}&otptype=CHNPWD&validatetype=Otp`);
    if (res.data.status === 'OTPVERIFY') {

      navigate('/change/password', {
        state: {
          email: sendBody.email
        }
      })
      setIsOtpValid(false);
    } else {
      setIsOtpValid(true);
    }
  }
  const handleSnackbarClose = (
    event?: any | Event,
    reason?: string
  ) => {
    event.preventDefault();
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
    setOtpSendSucc(false);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      loginHandler();
    }
  };

  useEffect(() => {
    if (typeof localStorage.getItem('clientid') === "object") {
      navigate("/login")
    }
  }, [])





  return (
    <Container
      component="main"
      maxWidth="xs"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "none",
      }}
    >
      <CssBaseline />
      <Box sx={[flipContainerStyle]}>
        {!flipCard ? (
          <Box
            sx={{
              ...flipCardStyle,
              transform: flipCard ? "rotateY(180deg)" : "rotateY(0deg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Avatar sx={{ m: 1, bgcolor: "primary.main", color: "white" }}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Sign In
                </Typography>
              </Box>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={sendBody.email}
                onChange={handleChange}
                name="email"
              />
              {errorHandling.emptyEmail == "EMPTY" ? (
                <Typography
                  variant="button"
                  gutterBottom
                  sx={{ display: "block", textAlign: "right", color: "red" }}
                >
                  Email can't be empty
                </Typography>
              ) : errorHandling.emptyEmail == "LONG" ? (
                <Typography
                  variant="button"
                  gutterBottom
                  sx={{ display: "block", textAlign: "right", color: "red" }}
                >
                  Email is too long
                </Typography>
              ) : null}
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                value={sendBody.password}
                onChange={handleChange}
                name="password"
                onKeyDown={handleKeyDown}
              />
              {errorHandling.emptyPassword == "EMPTY" && (
                <Typography
                  variant="button"
                  gutterBottom
                  sx={{ display: "block", textAlign: "right", color: "red" }}
                >
                  Password can't be empty
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                onClick={loginHandler}
              >
                {loginLoader ? (
                  <CircularProgress size={30} sx={{ color: "white" }} />
                ) : (
                  "Sign In"
                )}
              </Button>
              {errorHandling.invalidUser == "INVALID" ? (
                <Typography
                  variant="button"
                  gutterBottom
                  sx={{ display: "block", textAlign: "right", color: "red" }}
                >
                  Invalid User
                </Typography>
              ) : errorHandling.invalidUser == "SERVER" ? (
                <Typography
                  variant="button"
                  gutterBottom
                  sx={{ display: "block", textAlign: "right", color: "red" }}
                >
                  Unable to login, due to internal server error
                </Typography>
              ) : null}
              <Box onClick={() => setFlipCard(true)}>
                <Link variant="body2">Forgot password?</Link>
              </Box>
            </Paper>
          </Box>
        ) : (
          <Box
            sx={{
              ...flipCardStyle,
              ...flippedStyle,
              transform: flipCard ? "rotateY(0deg)" : "rotateY(180deg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Paper elevation={10} sx={{ p: 4, borderRadius: 2 }}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Avatar sx={{ m: 1, bgcolor: "primary.main", color: "white" }}>
                  <NoEncryptionGmailerrorredIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Forget Password
                </Typography>
              </Box>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={sendBody.email}
                onChange={handleChange}
                name="email"
                error={isValid === "EMAILINVALID"}
                helperText={isValid === "EMAILINVALID" && "Invalid Email Id"}
              />
              {errorHandling.emptyEmail == "EMPTY" ? (
                <Typography
                  variant="button"
                  gutterBottom
                  sx={{ display: "block", textAlign: "right", color: "red" }}
                >
                  Email can't be empty
                </Typography>
              ) : errorHandling.emptyEmail == "LONG" ? (
                <Typography
                  variant="button"
                  gutterBottom
                  sx={{ display: "block", textAlign: "right", color: "red" }}
                >
                  Email is too long
                </Typography>
              ) : null}
              {/* {isValid === "EMAILVALID" && ( */}
              {resendOTP === false && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 2,
                    gap: 1,
                  }}
                >
                  <OTP
                    // separator={<span>-</span>}
                    separator
                    value={otp}
                    onChange={setOtp}
                    length={6}
                  />
                  {isOptValid === true && (
                    <Typography color="red">Invalid OTP.</Typography>
                  )}
                  {otpTimmer > 0 && <Typography sx={{ color: otpTimmer > 0 ? "blue" : "red", width: '100%', display: 'flex', justifyContent: 'end', alignItems: 'end' }} >{otpTimmer} sec.</Typography>}
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 3,
                  textAlign: "center",
                }}
              >
                {isValid === "EMAILVALID" ? (
                  <Typography variant="subtitle2" gutterBottom>
                    OTP send to this email Id{" "}
                    <span style={{ color: "red" }}> {sendBody.email}</span>{" "}
                    please check.
                  </Typography>
                ) : // isValid==="EMAILINVALID"?
                  // <Typography variant="subtitle2" gutterBottom>
                  //   Invalid email please check.
                  // </Typography>
                  // :
                  null}
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2, mb: 2 }}
                onClick={isValid !== "EMAILVALID" ? verifyEmail : saveOTP}
              >
                {`${isValid !== "EMAILVALID" ? "Next" : "Submit"}`}
              </Button>
              <Box onClick={() => setFlipCard(false)}>
                <Link variant="body2">Sign In?</Link>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={
          <Box display="flex" alignItems="center">
            <CheckCircleIcon sx={{ color: "green", mr: 1 }} />{" "}
            {/* Green checkmark */}
            <Box display="flex" flexDirection="column">
              <Typography
                sx={{ color: "black", fontWeight: 600, fontSize: 17 }}
              >
                Sign In Successful
              </Typography>
              <Typography
                sx={{ color: "black", fontWeight: 400, fontSize: 14 }}
              >
                Welcome to the Asset Managemnet Dashboard
              </Typography>
            </Box>
          </Box>
        }
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" sx={{ color: "black" }} />
          </IconButton>
        }
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "white",
            color: "black",
          },
        }}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={otpSendSucc}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={
          <Box display="flex" alignItems="center">
            <CheckCircleIcon sx={{ color: "green", mr: 1 }} />{" "}
            {/* Green checkmark */}
            <Box display="flex" flexDirection="column">
              <Typography
                sx={{ color: "black", fontWeight: 600, fontSize: 17 }}
              >
                OTP Send Successful.
              </Typography>
              <Typography
                sx={{ color: "black", fontWeight: 400, fontSize: 14 }}
              >
                Please Check your email id.
              </Typography>
            </Box>
          </Box>
        }
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" sx={{ color: "black" }} />
          </IconButton>
        }
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "white",
            color: "black",
          },
        }}
      />

      {/* <Box sx={{ width: 500 }}>
        {buttons}
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={handleClose}
          key={vertical + horizontal}
        >
          OTP SEND
        </Snackbar>
      </Box> */}
    </Container>
  );
}

export default Auth;
