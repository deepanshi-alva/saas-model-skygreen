import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Topic from "./Topic";
import { Accordion } from "@/components/ui/accordion";
import Module from "./Module";
import axiosInstance from "@/config/axios.config";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { getFilePath } from "../../../../../config/file.path";
import { createPortal } from "react-dom";

function CourseModulePage({ handleNext, course, handleBack, isPublished }) {
  console.log("course form landingpage", course);
  const defaultModuleValue = {
    type: "",
    title: "",
    description: "",
    short_description: "",
    sequence_no: "",
    topics: [],
    videos: [],
    audios: [],
    images: [],
    files: [],
  };

  const [courseModules, setCourseModules] = useState([]);
  console.log("courseModules h kya --", courseModules);
  const [openAccordionValues, setOpenAccordionValue] = useState(["module0"]);
  const [isUploading, setIsUploading] = useState(false);

  const appendModule = () => {
    // console.log(courseModules.length + 1)
    setCourseModules((old) => [
      ...old,
      { ...defaultModuleValue, type: "Module", sequence_no: old.length + 1 },
    ]);
    setOpenAccordionValue((old) => [...old, `module${courseModules.length}`]);
  };
  const appendTopic = () => {
    setCourseModules((old) => [
      ...old,
      { ...defaultModuleValue, type: "Topic", sequence_no: old.length + 1 },
    ]);
    setOpenAccordionValue((old) => [...old, `module${courseModules.length}`]);
  };

  const handleOpenModuleAccordian = (accordianIndex) => {
    setOpenAccordionValue((old) => [...old, "module" + accordianIndex]);
  };

  const handleDeleteModule = (index) => {
    const newCourseModules = courseModules.filter((_, idx) => idx !== index);
    setCourseModules(newCourseModules);
    updateCourse(newCourseModules);
  };
  const handleSaveModule = (module, index) => {
    console.log("module", module);
    console.log("index", index);
    const newCourseModules = courseModules.map((old, oldIndex) => {
      if (index === oldIndex) return module;
      return old;
    });
    setCourseModules(newCourseModules);
    updateCourse(newCourseModules);
  };
  const uploadFile = async (files) => {
    let formData = new FormData();
    files.forEach((ele) => {
      if (ele instanceof File) {
        formData.append("files", ele);
      } else {
        console.warn("Skipping invalid file object:", ele);
      }
    });

    try {
      setIsUploading(true);
      const { data } = await axiosInstance({
        url: "/api/upload/",
        method: "post",
        data: formData,
      });
      const fileIds = data.map((ele) => ele.id);
      return fileIds;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const generateObj = async (topicData) => {
    // const topic = {...topicData};
    const { documentId, ...topic } = topicData;
    const processMedia = async (key) => {
      const previousItems = topic[key].filter((ele) => ele.id);
      const newItems = topic[key].filter((ele) => !ele.id);
      if (newItems.length) {
        const newItemsId = await uploadFile(newItems);
        topic[key] = [...previousItems, ...newItemsId];
      }
    };
    await processMedia("images");
    await processMedia("videos");
    await processMedia("audios");
    await processMedia("files");
    return topic;
  };

  //     const params = new URLSearchParams({
  //         "populate[0]": "course_tags",
  //         "populate[1]": "course_thumbnail",
  //         "populate[2]": "course_intro_video",
  //         "populate[3]": "modules.topics",
  //         "populate[4]": "modules.topics.videos",
  //         "populate[5]": "modules.topics.files",
  //         "populate[6]": "modules.topics.audios",
  //         "populate[7]": "modules.topics.images",
  //         "populate[8]": "modules.videos",
  //         "populate[9]": "modules.files",
  //         "populate[10]": "modules.audios",
  //         "populate[11]": "modules.images",
  //         "populate[11]": "instructors",
  //         "populate[12]": "departments",
  //         "populate[13]": "locations",
  //         "populate[14]": "courses_categories",
  //         "populate[15]": "highlights",
  //         status: "draft"

  //     });
  //     return params.toString();
  // };
  const UpdateGenerateQuery = () => {
    const params = new URLSearchParams({
      "populate[course_tags]": "true",
      "populate[course_thumbnail]": "true",
      "populate[course_intro_video]": "true",
      "populate[modules][populate][assignment]": "true",
      "populate[modules][populate][topics][populate][videos]": "true",
      "populate[modules][populate][topics][populate][files]": "true",
      "populate[modules][populate][topics][populate][audios]": "true",
      "populate[modules][populate][topics][populate][images]": "true",
      "populate[modules][populate][videos]": "true",
      "populate[modules][populate][files]": "true",
      "populate[modules][populate][audios]": "true",
      "populate[modules][populate][images]": "true",
      "populate[certificate]": "true",
      "populate[instructors]": "true",
      "populate[departments]": "true",
      "populate[locations]": "true",
      "populate[courses_categories]": "true",
      "populate[highlights]": "true",
    });

    return params.toString();
  };
  const convertIntoSimpleObj = (modules) => {
    const modulesData = modules?.map((module, idx) => {
      if (module.type === "Module") {
        return {
          documentId: module?.documentId,
          type: module.type,
          title: module.title,
          assignment: module.assignment,
          description: module.description,
          short_description: module.short_description,
          sequence_no: module?.sequence_no || idx + 1,
          topics:
            module?.topics?.map((ele, tidx) => {
              const ele1 = {
                documentId: ele?.documentId,
                title: ele.title,
                description: ele.description,
                sequence_no: ele?.sequence_no || tidx + 1,
                videos:
                  ele?.videos?.map((ele) => ({
                    id: ele.id,
                    url: getFilePath(ele.url),
                    name: ele.name,
                    size: ele.size * 1024,
                  })) || [],
                audios:
                  ele?.audios?.map((ele) => ({
                    id: ele.id,
                    url: getFilePath(ele.url),
                    name: ele.name,
                    size: ele.size * 1024,
                  })) || [],
                images:
                  ele?.images?.map((ele) => ({
                    id: ele.id,
                    url: getFilePath(ele.url),
                    name: ele.name,
                    size: ele.size * 1024,
                  })) || [],
                files:
                  ele?.files?.map((ele) => ({
                    id: ele.id,
                    url: getFilePath(ele.url),
                    name: ele.name,
                    size: ele.size * 1024,
                  })) || [],
              };
              return ele1;
            }) || [],
        };
      } else {
        return {
          documentId: module?.documentId,
          type: module.type,
          title: module.title,
          description: module.description,
          sequence_no: module?.sequence_no || idx + 1,
          videos:
            module?.videos?.map((ele) => ({
              id: ele.id,
              url: getFilePath(ele.url),
              name: ele.name,
              size: ele.size * 1024,
            })) || [],
          audios:
            module?.audios?.map((ele) => ({
              id: ele.id,
              url: getFilePath(ele.url),
              name: ele.name,
              size: ele.size * 1024,
            })) || [],
          images:
            module?.images?.map((ele) => ({
              id: ele.id,
              url: getFilePath(ele.url),
              name: ele.name,
              size: ele.size * 1024,
            })) || [],
          files:
            module?.files?.map((ele) => ({
              id: ele.id,
              url: getFilePath(ele.url),
              name: ele.name,
              size: ele.size * 1024,
            })) || [],
        };
      }
    });
    return modulesData;
  };
  const updateCourse = async (newCourseModules) => {
    console.log("newCourseModules", newCourseModules);
    try {
      // const newObj = []
      const modulesId = [];
      for (const ele of newCourseModules) {
        console.log("ele", ele);

        if (ele.type === "Topic") {
          const obj = await generateObj(ele);
          // newObj.push({ ...obj })
          console.log("before root level topic ", obj);
          //root topic
          const { data: topic } = await axiosInstance({
            // url: !obj.documentId ? `/api/modules?status=draft` : `/api/modules/${obj.documentId}?status=draft`,
            url: !obj.documentId
              ? `/api/modules`
              : `/api/modules/${obj.documentId}`,
            method: !obj.documentId ? "POST" : "put",
            data: {
              data: { ...obj, type: "Topic" },
            },
          });

          modulesId.push({ id: topic.data.id });
          // if (!ele.documentId) {
          //     ele.documentId = topic?.data?.documentId;
          // }
          console.log("after root level topic ", topic);
        } else {
          // const topics = []
          const topicsIds = [];
          if (ele?.topics?.length) {
            //for inner topics
            for (const topic of ele.topics) {
              const obj = await generateObj(topic);
              console.log("obj", obj);
              console.log("before module level topic ", topic);
              const { data } = await axiosInstance({
                // url: topic?.documentId ? `/api/modules/${topic?.documentId}?status=draft` : '/api/modules?status=draft',
                url: topic?.documentId
                  ? `/api/modules/${topic?.documentId}`
                  : "/api/modules",
                method: topic?.documentId ? "PUT" : "POST",
                data: {
                  data: { ...obj, topics: null, type: "Topic" },
                },
              });
              console.log("topic", data);
              topicsIds.push({ id: data?.data?.id });
              // topics.push({ ...obj })
              console.log("after module level topic ", data);
              // if (!topic.documentId) {
              //     topic.documentId = data?.data?.documentId;
              // }
            }
          }
          //for modules
          // newObj.push({ ...ele, topics: topicsIds })
          const { documentId, topics, assignment, ...rest } = ele;
          const formattedAssignment = assignment?.id ? assignment.id : null;

          console.log("elevxcvxcvxcvxcvcv", {
            ...rest,
            topics: topicsIds,
            type: "Module",
          });
          const { data: modules } = await axiosInstance({
            url: ele?.documentId
              ? `/api/modules/${ele.documentId}`
              : `/api/modules`,
            //url: ele?.documentId ? `/api/modules/${ele.documentId}` : `/api/modules`,
            method: ele.documentId ? "PUT" : "POST",
            data: {
              data: {
                ...rest,
                assignment: formattedAssignment,
                topics: topicsIds,
                type: "Module",
              },
            },
          });
          modulesId.push({ id: modules.data.id });

          console.log("topicsIds", topicsIds);
          // console.log('newObj', newObj);
        }
      }
      //attach modules to course
      // const { data } = await axiosInstance({
      //     url: `/api/courses/${course.documentId}?${generateQuery()}`,
      //     method: 'PUT',
      //     data: {
      //         data: { modules: modulesId },
      //     }
      // });
      console.log("modules", modulesId);
      const { data } = await axiosInstance({
        url: `/api/courses/${
          course.documentId
        }?${UpdateGenerateQuery()}&status=${
          isPublished ? "published" : "draft"
        }`,
        method: "PUT",
        data: {
          data: {
            modules: modulesId,
            data: {
              data: {
                ...formData,
                course_enrollments: {
                  set: course?.course_enrollments.map((ele) => ({
                    documentId: ele.documentId,
                  })),
                },
              },
            },
          },
        },
      });
      console.log(data, "last data");
      const moduleData = convertIntoSimpleObj(data.data.modules);
      setCourseModules(moduleData);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const obj = convertIntoSimpleObj(course.modules);
    console.log("obj--", obj);
    setCourseModules(obj);
  }, [course.modules]);

  function handleOnDragEnd(result) {
    if (!result.destination) return;
    const newBox = Array.from(courseModules);
    const [draggedItem] = newBox.splice(result.source.index, 1);
    newBox.splice(result.destination.index, 0, draggedItem);
    setCourseModules(newBox);
    updateCourse(newBox);
  }

  console.log("course modules inside CourseModulePages", course, courseModules);
  return (
    <>
      <div
        className={`col-span-12 xl:col-span-9 mr-5 ${
          !courseModules?.length ? "" : ""
        }`}
      >
        <div className="grid grid-cols-12 gap-4">
          {!courseModules?.length ? (
            <div className="col-span-12 mb-0 mt-0 min-h-[500px] bg-card rounded-md shadow-sm">
              <div className="grid grid-cols-12 gap-6 py-9 items-center justify-center text-center min-h-[500px]">
                <div className="col-span-12 lg:col-span-12 courseHeading">
                  <h2 className="text-3xl font-bold pb-5">
                    Create your course content
                  </h2>
                  <h3 className="text-2xl font-md pb-5">
                    Use modules and topics to organize your course
                  </h3>
                  <Button
                    type="button"
                    size="xl"
                    variant=""
                    color="default"
                    className="cursor-pointer mr-5"
                    onClick={appendModule}
                  >
                    Add Module{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.2em"
                      height="1.2em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M18 12h-6m0 0H6m6 0V6m0 6v6"
                      />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    size="xl"
                    variant="outline"
                    color="default"
                    className="cursor-pointer"
                    onClick={appendTopic}
                  >
                    Add topic{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.2em"
                      height="1.2em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M18 12h-6m0 0H6m6 0V6m0 6v6"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-span-12 lg:col-span-12">
              <Accordion
                type="multiple"
                className="w-full space-y-3.5"
                defaultValue={["module0"]}
                onValueChange={(value) => {
                  setOpenAccordionValue(value), console.log(value);
                }}
                value={openAccordionValues}
              >
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="accordion" type="MODULES">
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="w-full space-y-3.5"
                      >
                        {courseModules.map((item, index) => (
                          <Draggable
                            key={item.sequence_no}
                            draggableId={`${item.sequence_no}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {item.type === "Topic" ? (
                                  <Topic
                                    topic={item}
                                    index={index}
                                    handleSave={handleSaveModule}
                                    openAccordionValues={openAccordionValues}
                                    handleDeleteTopic={handleDeleteModule}
                                    accordionPrefix={"module"}
                                    handleOpenAccordian={
                                      handleOpenModuleAccordian
                                    }
                                  />
                                ) : (
                                  <Module
                                    module={item}
                                    index={index}
                                    handleSave={handleSaveModule}
                                    handleDeleteModule={handleDeleteModule}
                                    accordionPrefix={"module"}
                                    handleOpenAccordian={
                                      handleOpenModuleAccordian
                                    }
                                  />
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Accordion>
            </div>
          )}
        </div>
        <div className="col-span-12 lg:col-span-12 mt-6">
          <div className="pt-2 gap-4 flex w-full">
            {courseModules?.length > 0 && (
              <>
                <Button
                  type="button"
                  size="xl"
                  variant=""
                  color="default"
                  className="cursor-pointer mr-2"
                  onClick={appendModule}
                >
                  Add Module{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="2em"
                    height="2em"
                    className="ml-2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </Button>
                <Button
                  type="button"
                  size="xl"
                  variant="outline"
                  color="default"
                  className="cursor-pointer"
                  onClick={appendTopic}
                >
                  Add topic{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="2em"
                    height="2em"
                    className="ml-2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </Button>
              </>
            )}
            <div className="flex justify-end gap-4 mt-0 w-full">
              <Button
                type={"button"}
                size="xl"
                variant="outline"
                color="default"
                className="cursor-pointer"
                onClick={() => {
                  handleBack(course.documentId);
                }}
              >
                Back
              </Button>
              <Button
                type={"button"}
                size="xl"
                variant=""
                color="default"
                className="cursor-pointer"
                onClick={() => {
                  handleNext(course.documentId);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isUploading &&
        createPortal(
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-[9999999] flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg text-center">
              <span className="loader mb-2 block"></span>
              <p>Uploading files, please wait...</p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default CourseModulePage;
