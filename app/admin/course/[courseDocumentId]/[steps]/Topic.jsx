import React, { useEffect, useRef, useState } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input'
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import FilePicker from './FilePicker'
import TextEditor from './TextEditor'
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import MediaPreview from './MediaPreview'
function Topic({ topic, index, handleSave, openAccordionValues, handleDeleteTopic, accordionPrefix, handleOpenAccordian }) {
    const [textInput, setTextInput] = useState('')
    const [courseTopic, setCourseTopic] = useState(topic)
    const [isEditName, setIsEditName] = useState(!courseTopic.title)
    const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false)
    const [pickerObj, setPickerObj] = useState({
        mediaType: '',
        multiple: true
    })
    const [isOpenTextEditor, setIsOpenTextEditor] = useState(false)

    const inputTitleRef = useRef(null)


    // const openMediaPiker = (type, field, event) => {
    //     if (event)
    //         event.stopPropagation()
    //     setPickerObj({
    //         mediaType: type,
    //         multiple: true,
    //         field
    //     })
    // };
    const openMediaPiker = (type, field, event) => {
        if (event) event.stopPropagation();
        
        setPickerObj({
            mediaType: type,
            multiple: field === "videos" ? false : true, // Allow only one video
            field
        });
    };
    
    const closeMediaPiker = () => {
        setPickerObj({
            mediaType: '',
            multiple: true,
        })
    };
    // const handleMediaPicker = (files) => {
    //     if (!files.length) return;
    //     const previousMedia = courseTopic[pickerObj.field]
    //     const newCourseTopic = { ...courseTopic, [pickerObj.field]: [...previousMedia, ...files] }
    //     setCourseTopic(newCourseTopic)
    //     closeMediaPiker()
    //     handleSave(newCourseTopic, index)
    // }
    const handleMediaPicker = (files) => {
        if (!files.length) return;
    
        let newCourseTopic = { ...courseTopic };
    
        if (pickerObj.field === "videos") {
            // Only allow one video
            newCourseTopic[pickerObj.field] = [files[0]];
        } else {
            // Allow multiple files for other media types
            newCourseTopic[pickerObj.field] = [...(newCourseTopic[pickerObj.field] || []), ...files];
        }
    
        setCourseTopic(newCourseTopic);
        closeMediaPiker();
        handleSave(newCourseTopic, index);
    };
    
    const handleMediaRemove = (mediaIndex, field) => {
        const newCourseTopic = { ...courseTopic, [field]: courseTopic[field].filter((_, i) => i !== mediaIndex) }
        setCourseTopic(newCourseTopic)
        handleSave(newCourseTopic, index)
    }
    const saveModuleName = (value) => {
        const newCourseTopic = { ...courseTopic, title: value || (`Topic ${index + 1}`) }
        setCourseTopic(newCourseTopic)
        setTextInput('')
        setIsEditName(false)
        handleSave(newCourseTopic, index)
        
    }

    const openTextContentEditor = (event) => {
        if (event)
            event.stopPropagation()
        setIsOpenTextEditor(true)
    }
    const saveTextContent = (editorContent) => {
        const newCourseTopic = { ...courseTopic, description: editorContent }
        setCourseTopic(newCourseTopic)
        closeTextContentEditor()
        handleSave(newCourseTopic, index)

    }

    const closeTextContentEditor = () => {
        setIsOpenTextEditor(false)
    }
    const handleTitleEditButton = (event) => {
        event.stopPropagation()
        setTextInput(courseTopic.title)
        setIsEditName(true)
        handleOpenAccordian(index)
        setTimeout(() => {
            inputTitleRef.current.focus()
        }, 0)
    }
    const handleDelete = (event) => {
        if (event)
            event.stopPropagation()
        setIsDeleteModelOpen(true)
    }

    const isEmpty = () => {

    }
    console.log('topic', topic);
    return (
        <>
            <DeleteConfirmationDialog
                deleteDescription={'Are You Sure For Delete Topic?'}
                headingMessage={' '}
                open={isDeleteModelOpen}
                onClose={() => setIsDeleteModelOpen(false)}
                onConfirm={() => handleDeleteTopic(index)}
            />
            <AccordionItem className="bg-background border-b-2 topicAccordionBlock shadow-sm p-0" value={accordionPrefix + index}  >
                <AccordionTrigger className='topicHeading space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center'>
                    <div className="flex items-center space-x-2 text-xl font-medium justify-between w-full">
                        <div className='flex items-center'><svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="26" height="26" viewBox="0 0 2048 2048"><path fill="#f97316" d="M1755 512h-475V37zm37 128v1408H128V0h1024v640z" /></svg>
                            <span className="lightTextModule">Topic {index + 1}.&nbsp;</span>
                            {textInput || courseTopic.title || (`Topic ${index + 1}`)}
                            <div className='flex items-center gap-3 ml-2'>
                                {!isEditName &&
                                    <div onClick={handleTitleEditButton} className='editIcon'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 20 20"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M3.944 11.79a.5.5 0 0 1 .141-.277L14.163 1.435a.5.5 0 0 1 .707 0l3.89 3.89a.5.5 0 0 1 0 .706L8.68 16.11a.5.5 0 0 1-.277.14l-4.595.706a.5.5 0 0 1-.57-.57zm.964.314l-.577 3.76l3.759-.578l9.609-9.608l-3.183-3.182z" /><path d="m15.472 8.173l-3.537-3.53l.707-.708l3.536 3.53z" /></g></svg>
                                    </div>}
                                <div onClick={handleDelete} className='editIcon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m6.774 6.4l.812 13.648a.8.8 0 0 0 .798.752h7.232a.8.8 0 0 0 .798-.752L17.226 6.4zm11.655 0l-.817 13.719A2 2 0 0 1 15.616 22H8.384a2 2 0 0 1-1.996-1.881L5.571 6.4H3.5v-.7a.5.5 0 0 1 .5-.5h16a.5.5 0 0 1 .5.5v.7zM14 3a.5.5 0 0 1 .5.5v.7h-5v-.7A.5.5 0 0 1 10 3zM9.5 9h1.2l.5 9H10zm3.8 0h1.2l-.5 9h-1.2z" /></svg>
                                </div>
                            </div>
                        </div>
                        {openAccordionValues.find(ele => ele === accordionPrefix + index) && <div className="col-span-12 lg:col-span-6 justify-end mr-8">
                            <Button disabled={courseTopic.videos.length >= 1} 
                                type='button' size="icon" variant="outline" className="cursor-pointer mr-3 group" onClick={(event) => { openMediaPiker('video', 'videos', event) }}>
                                <Icon icon="mdi:video" className="h-6 w-6 " />
                            </Button>
                            <Button type='button' size="icon" variant="outline" className="cursor-pointer mr-3 group" onClick={(event) => { openMediaPiker('files', 'files', event) }}>
                                <Icon icon="mdi:files" className="h-6 w-6 " />
                            </Button>
                            <Button type='button' size="icon" variant="outline" className="cursor-pointer mr-3 group" onClick={(event) => { openTextContentEditor(event) }}>
                                {courseTopic.description ? <Icon icon="fluent:slide-text-edit-24-filled" className="h-6 w-6 " /> : <Icon icon="mingcute:text-area-fill" className="h-6 w-6 " />}
                            </Button>
                            <Button type='button' size="icon" variant="outline" className="cursor-pointer mr-3 group" onClick={(event) => { openMediaPiker('image', 'images', event) }}>
                                <Icon icon="material-symbols:image" className="h-6 w-6 " />
                            </Button>
                            <Button type='button' size="icon" variant="outline" className="cursor-pointer mr-3 group" onClick={(event) => { openMediaPiker('audio', 'audios', event) }}>
                                <Icon icon="ant-design:audio-filled" className="h-6 w-6 " />
                            </Button>
                        </div>}
                    </div>
                </AccordionTrigger>
                <AccordionContent className={` ${openAccordionValues.find(ele => ele === accordionPrefix + index) ? 'p-6 wp-full' : ''} justify-center`}>
                    {!isEditName && !courseTopic.description && !courseTopic.videos && !courseTopic.audios && !courseTopic.files && !courseTopic.images && <p>Add content in your topic</p>}
                    {isEditName && <div className='flex w-full py-6 justify-center'>
                        <Input ref={inputTitleRef} type="text" placeholder={`Topic Title`} size="xl" value={textInput} onChange={(event) => { setTextInput(event.target.value) }} onBlur={(event) => { saveModuleName(event.target.value) }} onKeyPress={(event) => event.key === 'Enter' && saveModuleName(event.target.value)} />
                    </div>
                    }
                    {courseTopic.description &&
                        <div className='flex topicHeading topicEditContent'>
                            <div className="text-base truncate-multiline" dangerouslySetInnerHTML={{ __html: courseTopic.description }}></div>
                            <div onClick={(event) => { openTextContentEditor(event) }} className='editIcon self-end '>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 20 20"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M3.944 11.79a.5.5 0 0 1 .141-.277L14.163 1.435a.5.5 0 0 1 .707 0l3.89 3.89a.5.5 0 0 1 0 .706L8.68 16.11a.5.5 0 0 1-.277.14l-4.595.706a.5.5 0 0 1-.57-.57zm.964.314l-.577 3.76l3.759-.578l9.609-9.608l-3.183-3.182z" /><path d="m15.472 8.173l-3.537-3.53l.707-.708l3.536 3.53z" /></g></svg>
                            </div>
                        </div>
                    }
                    <MediaPreview files={courseTopic.videos} type={'videos'} handleMediaRemove={handleMediaRemove} />
                    <MediaPreview files={courseTopic.files} type={'files'} handleMediaRemove={handleMediaRemove} />
                    <MediaPreview files={courseTopic.images} type={'images'} handleMediaRemove={handleMediaRemove} />
                    <MediaPreview files={courseTopic.audios} type={'audios'} handleMediaRemove={handleMediaRemove} />
                </AccordionContent>
            </AccordionItem >
            {
                pickerObj.mediaType && <FilePicker mediaType={pickerObj.mediaType} multiple={pickerObj.multiple}
                    closeMediaPiker={closeMediaPiker}
                    handleMediaPicker={handleMediaPicker}
                />
            }
            {isOpenTextEditor && <TextEditor handleClose={closeTextContentEditor} handleSave={saveTextContent} initialContent={courseTopic.description} />}
        </>
    )
}

export default Topic