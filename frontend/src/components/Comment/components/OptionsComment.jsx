import React, { useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { SlOptions } from "react-icons/sl";

import useOutsideClick from "../../../layout/components/hooks/useOutsideClick.jsx";
import OvalLoader from "../../OvalLoader.jsx";
import { useDeleteComment } from "../../../features/comment/index.jsx";

function OptionsComment({ idComment, setReadyOnly }) {
  const [open, setOpen] = useState(false);

  const ref = useOutsideClick(() => setOpen(false));

  const { deleteComment, loadingDeleteComment } = useDeleteComment();

  function handleDeleteComment() {
    deleteComment(idComment);
    setOpen((prev) => !prev);
  }

  return (
    <div
      ref={ref}
      className={"relative flex flex-col items-center justify-center"}
    >
      {loadingDeleteComment ? (
        <OvalLoader />
      ) : (
        <SlOptions
          className={
            "h-6 w-6 cursor-pointer rounded-full p-1 text-slate-800 hover:bg-slate-100"
          }
          onClick={(e) => {
            setOpen((prev) => !prev);
          }}
        />
      )}

      {open && (
        <div
          className={
            "absolute bottom-0 right-1/2 z-10 translate-y-full divide-y divide-gray-200 overflow-hidden rounded bg-slate-100 text-sm italic shadow-xl"
          }
        >
          <p
            className={
              "flex items-center gap-x-1 p-2 hover:cursor-pointer hover:bg-slate-300"
            }
            onClick={() => setReadyOnly(false)}
          >
            <AiFillEdit className={"h-4 w-4 text-slate-800"} />
            <span>Edit</span>
          </p>
          <p
            className={
              "flex items-center gap-x-1 p-2 hover:cursor-pointer hover:bg-slate-300"
            }
            onClick={handleDeleteComment}
          >
            <AiFillDelete className={"h-4 w-4 text-red-800"} />
            <span>Delete</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default OptionsComment;
