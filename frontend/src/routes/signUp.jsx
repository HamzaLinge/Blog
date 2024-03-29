import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

import PATH from "../config/route-path.jsx";
import CustomInput from "../components/Custom/CustomInput.jsx";
import OvalLoader from "../components/OvalLoader.jsx";
import CustomInputFile from "../components/Custom/CustomInputFile.jsx";
import ErrorGraphQL from "../components/ErrorGraphQL";
import { useSignUp } from "../features/authentication";

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm();

  const { signUp, error } = useSignUp();

  function handleSignUp(data) {
    signUp(
      data.username,
      data.email,
      data.password,
      data.firstName,
      data.lastName,
      data.files[0]
    );
  }

  return (
    <div className={"flex h-screen flex-col items-center"}>
      <h1
        className={
          "left-1/2 my-10 text-5xl font-semibold text-slate-800 md:text-6xl"
        }
      >
        Sign Up
      </h1>
      <form
        onSubmit={handleSubmit(handleSignUp)}
        className={
          "absolute top-1/2 flex w-[calc(100%_-_10px)] max-w-xl -translate-y-1/2 flex-col items-center gap-y-14 rounded-lg bg-slate-800 px-2 py-4 shadow-2xl md:w-full"
        }
      >
        <div
          className={
            "flex w-full flex-col items-center gap-10 md:flex-row md:gap-2"
          }
        >
          <CustomInput
            name={"username"}
            placeholder={"Username"}
            register={register}
            errors={errors}
            rules={{
              required: "Please, enter a username",
              minLength: {
                value: 4,
                message: "Username must be at least 4 characters long",
              },
            }}
          />
          <CustomInput
            name={"email"}
            placeholder={"Email"}
            register={register}
            errors={errors}
            rules={{
              required: "Please, enter an email address",
              pattern: {
                value:
                  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                message: "Please enter a valid email",
              },
            }}
          />
        </div>
        <div className={"flex w-full flex-col items-center gap-10"}>
          <div className={"flex w-full items-center gap-x-2"}>
            <CustomInput
              name={"firstName"}
              placeholder={"First Name"}
              register={register}
              errors={errors}
              rules={{
                required: "Please, enter your first name",
              }}
            />
            <CustomInput
              name={"lastName"}
              placeholder={"Last Name"}
              register={register}
              errors={errors}
              rules={{
                required: "Please, enter your last name",
              }}
            />
          </div>
          <div className={"flex w-full items-center gap-x-2"}>
            <CustomInput
              type={"password"}
              name={"password"}
              placeholder={"Password"}
              register={register}
              errors={errors}
              rules={{
                required: "Please, enter a password",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              }}
            />
            <CustomInput
              type={"password"}
              name={"confirmPassword"}
              placeholder={"Confirm Password"}
              register={register}
              errors={errors}
              rules={{
                required: "Please, confirm the password",
                minLength: {
                  value: 6,
                  message: "It must be at least 6 characters long",
                },
                validate: (value) => {
                  if (watch("password") !== value) {
                    return "Your passwords do no match";
                  }
                },
              }}
            />
          </div>
        </div>
        <CustomInputFile
          name={"files"}
          register={register}
          errors={errors}
          rules={{
            required: "Please, select a profile photo",
          }}
          classImage={"!rounded-full !w-24 !aspect-square"}
        />
        <button type={"submit"} className={"btn-form mb-4"}>
          {isSubmitting ? <OvalLoader /> : "Sign Up"}
        </button>
        {error && <ErrorGraphQL errorGraphQL={error} />}
        <Link
          to={"../" + PATH.SIGN_IN}
          className={"link-form absolute right-1 bottom-1 text-xs"}
        >
          Sign In
        </Link>
      </form>
    </div>
  );
}

export default SignUp;
