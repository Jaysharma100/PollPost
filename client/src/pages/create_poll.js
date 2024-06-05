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
        if (optionText === "" && optionImage === null) {
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
        const updatedOptions = options.filter(option => option.id !== id);
        setOptions(updatedOptions);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('options', JSON.stringify(options.map(option => ({ text: option.text }))));

        options.forEach((option, index) => {
            if (option.image) {
                formData.append('optionImages', option.image);
            }
        });

        try {
            const response = await fetch('http://localhost:8000/api/create_poll', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Poll created successfully:', data);
                // Reset form fields
                setTitle('');
                setContent('');
                setOptions([]);
            } else {
                console.error('Failed to create poll:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating poll:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div className='a9vhdown'>
                <h3>Create a POLL 🙃</h3 >
                <form className='pollinput' onSubmit={handleSubmit}>
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
                    <button type="submit" className='pollcreate_btn'>CREATE</button>
                </form>
                <h3>OPTIONS ADDED - {options.length}</h3 >
                <div className='optionview'>
                    {options.map((option, index) => (
                        <div key={option.id} className='optiondiv'>
                            <button onClick={() => handleDeleteOption(option.id)}>Delete</button>
                            <p> <b>Option {index + 1}</b> :<br></br> {option.text}</p>
                            {option.image && <img src={URL.createObjectURL(option.image)} alt="Option" />}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CreatePoll;
