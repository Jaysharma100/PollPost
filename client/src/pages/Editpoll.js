import React, { useState, useEffect, useRef, useContext } from 'react';
import Navbar from '../components/Navbar.js';
import { Datacontext } from '../Context/Dataprovider.js';
import { useParams, useNavigate } from 'react-router-dom';

const Editpoll = () => {
    const { pollid } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [options, setOptions] = useState([]);
    const [optionText, setOptionText] = useState('');
    const [optionImage, setOptionImage] = useState(null);
    const fileInputRef = useRef(null);
    const { account } = useContext(Datacontext);

    useEffect(() => {
        const fetchPollData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/poll/${pollid}`, {
                    headers: {
                        'authorization': sessionStorage.getItem('accessToken')
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setTitle(data.title);
                setContent(data.content);
                setOptions(data.options.map((option, index) => ({
                    id: index,
                    text: option.text,
                    image: option.image
                })));
            } catch (error) {
                console.error('Error fetching poll data:', error);
            }
        };

        fetchPollData();
    }, [pollid]);

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
        if (optionText === '' && optionImage === null) {
            return;
        }
        const newOption = {
            id: Date.now(),
            text: optionText,
            image: optionImage,
        };
        setOptions([...options, newOption]);

        setOptionText('');
        setOptionImage(null);
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
        formData.append('options', JSON.stringify(options.map(option => ({ text: option.text, image: option.image }))));

        options.forEach((option, index) => {
            if (option.image && option.image instanceof File) {
                formData.append('optionImages', option.image);
            }
        });

        try {
            const response = await fetch(`http://localhost:8000/api/update_poll/${pollid}`, {
                method: 'POST',
                headers: {
                    'authorization': sessionStorage.getItem('accessToken')
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Poll updated successfully:', data);
            navigate('/mypolls');
        } catch (error) {
            console.error('Error updating poll:', error);
        }
    };

    const handleDeletePoll = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/delete_poll/${pollid}`, {
                method: 'POST',
                headers: {
                    'authorization': sessionStorage.getItem('accessToken')
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Poll deleted successfully:', data);
            navigate('/mypolls');
        } catch (error) {
            console.error('Error deleting poll:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div className='a9vhdown'>
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
                    <button type="submit" className='pollcreate_btn'>UPDATE</button>
                    <button type="button" onClick={handleDeletePoll} className='polldelete_btn'>DELETE</button>
                </form>
                <div className='optionview'>
                    <h3>OPTIONS ADDED: {options.length}</h3>
                    {options.map((option, index) => (
                        <div key={option.id} className='optiondiv'>
                            <div>
                                <button onClick={() => handleDeleteOption(option.id)}>Delete</button>
                                <p><b>Option {index + 1}</b> : {option.text}</p>
                            </div>
                            {option.image && (option.image instanceof File ? (
                                <img src={URL.createObjectURL(option.image)} alt="Option" />
                            ) : (
                                <img src={`http://localhost:8000/uploads/${option.image}`} alt="Option" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Editpoll;
