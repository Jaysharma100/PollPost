import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';

const CreatePoll = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [options, setOptions] = useState([]);
    const [optionText, setOptionText] = useState('');
    const [optionImage, setOptionImage] = useState(null);
    const fileInputRef = useRef(null); // Ref for the file input element

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleContentChange = (event) => {
        setContent(event.target.value);
    };

    const handleOptionTextChange = (event) => {
        setOptionText(event.target.value);
    };

    const handleOptionImageChange = (event) => {
        setOptionImage(event.target.files[0]);
    };

    const handleAddOption = () => {
        // Create a new option object
        if (optionText==="" && optionImage===null) {
          return;
        }
        const newOption = {
            id: Date.now(), // Assign a unique id to the option
            text: optionText,
            image: optionImage,
        };
        setOptions([...options, newOption]);

        setOptionText('');
        setOptionImage(null);
        // Reset file input to default (clear selection)
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteOption = (id) => {
        // Filter out the option with the specified id
        const updatedOptions = options.filter(option => option.id !== id);
        setOptions(updatedOptions);
    };

    return (
        <>
        <Navbar />
        <div className='a9vhdown'>
            <h3>Create a POLL 🙃</h3 >
            <form className='pollinput'>
                <label htmlFor='titleinput'>Title</label>
                <input
                    name='titleinput'
                    type="text"
                    className='titleinput'
                    placeholder='Here goes the Title'
                    value={title}
                    onChange={handleTitleChange}
                    required
                />
                <label htmlFor='contentinput'>Content</label>
                <textarea
                    name="contentinput"
                    className='contentinput'
                    value={content}
                    onChange={handleContentChange}
                ></textarea>
                <label htmlFor="optionText">Add Option Text</label>
                <input
                    type="text"
                    id="optionText"
                    value={optionText}
                    onChange={handleOptionTextChange}
                    required
                />
                <label htmlFor="optionImage">Add Option Image</label>
                <input
                    type="file"
                    id="optionImage"
                    accept="image/*"
                    onChange={handleOptionImageChange}
                    ref={fileInputRef}
                />
                <button type="button" onClick={handleAddOption} className='optionadd'>Add Option</button>
            </form>
            <h3>OPTIONS ADDED -{options.length}</h3 >
            {/* Display added options */}
            <div className='optionview'>
                {options.map((option, index) => (
                    <div key={option.id} className='optiondiv'>
                        <button onClick={() => handleDeleteOption(option.id)}>Delete</button>
                        <p> <b>Option {index+1}</b> :<br></br> {option.text}</p>
                        {option.image && <img src={URL.createObjectURL(option.image)} alt="Option" />}
                    </div>
                ))}
            </div>
            <button className='pollcreate_btn'>CREATE</button>
        </div>
        </>
    );
};

export default CreatePoll;
