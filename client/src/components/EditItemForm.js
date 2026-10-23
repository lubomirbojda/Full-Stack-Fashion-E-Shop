import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import getAuthHeader from '../hooks/AuthHeader';


const EditItemForm = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const authHeader = getAuthHeader();
    const baseUrl = 'http://localhost:5000/';
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newQuant, setNewQuant] = useState('');

    const [mainImage, setMainImage] = useState('');
    const [newMainImage, setNewMainImage] = useState(null);
    const [otherImages, setOtherImages] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [newOtherImages, setNewOtherImages] = useState([]);
    const [isMainImageChanged, setIsMainImageChanged] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSelectedIdsChange = (imageId) => {
        setSelectedIds((prev) => {
            if (prev.includes(imageId)) {
              return prev.filter(id => id !== imageId);
            } else {
              return [...prev, imageId];
            }
        });
    };

    const handleNewName = (e) => {
        setNewName(e.target.value);
    };

    const handleOtherImagesChange = (e) => {
        const newImages = Array.from(e.target.files);
        setNewOtherImages((prevImages) => [...prevImages, ...newImages]);
    };

    const handleRemoveOtherImage = (index) => {
        setNewOtherImages((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleNewMainImage = (e) => {
        const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validImageTypes.includes(e.target.files[0].type)) {
            e.target.value = '';
            setNewMainImage(null);
            alert('Obrázok musí byť type png/jpg/jpeg!');
            return;
        }
        setNewMainImage(e.target.files[0])
    }


    useEffect(() => {
        const fetchItems = async () => {

            try {
                const response = await axios.get(`/api/polozka/getDetailsById/${id}`);
                const { nazov, popis, cena, pocet_ks } = response.data;
                setNewName(nazov);
                setNewDesc(popis);
                setNewPrice(cena);
                setNewQuant(pocet_ks);
            } catch (err) {
                console.error(err);
            }

            try {               
                const response = await axios.get(`/api/obrazky/getAllImagesByItemId/${id}`);
                setMainImage(response.data[0]);
                response.data.shift();
                setOtherImages(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchItems(); 
    }, [id]);


    const validate = () => {
        const errors = {};

        if (!newName.trim())
        {
            errors.newName = "Názov nesmie byť prázdny!";
        }
        if (!newPrice || isNaN(Number(newPrice)))
        {
            errors.newPrice = "Cena musí byť číslo!";
        } else if (Number(newPrice) <= 0) 
        {
            errors.newPrice = "Cena musí byť väčšia ako 0!";
        }
        if (!newQuant || !Number.isInteger(Number(newQuant))) {
            errors.newQuant = "Počet kusov musí byť celé číslo!";
        } else if (Number(newQuant) < 0) {
            errors.newQuant = "Počet kusov musí byť 0 alebo viac!";
        }

        if (isMainImageChanged) {
            if (!newMainImage) {
                errors.newMainImage = "Hlavný obrázok musí byť zvolený!"
            }
        }

        return errors;
    };

    const handleSubmit = async () => {

        const validationErr = validate();
        if (Object.keys(validationErr).length > 0)
        {
            setErrors(validationErr);
            return;
        }

        setErrors({});
        const formData = new FormData();
        formData.append('nazov', newName);
        formData.append('popis', newDesc);
        formData.append('cena', newPrice);
        formData.append('pocet_ks', newQuant);

        for (const imageId of selectedIds) 
        {
            formData.append('deleteImagesIds[]', imageId);
        }

        if (isMainImageChanged)
        {
            formData.append('mainImage', newMainImage);
        }

        for (const image of newOtherImages)
        {
            formData.append('otherImages[]', image);
        }

        try {
            await axios.put(`/api/polozka/updateItemById/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...authHeader.headers
                },
            });
        } catch (error) {
            console.error('Chyba pri aktualizácii položky:', error);
            alert('Chyba pri aktualizácii položky.');
        }

        navigate('/katalog');
    };

    return(
        <div>
            <div class="mb-3 m-4">
                <label for="Nazov" class="form-label">Názov</label>
                <input type="text" className={`form-control ${errors.newName ? 'input-error' : ''}`} id="Nazov" value={newName} onChange={handleNewName} required/>
                {errors.newName && <p className='error'>{errors.newName}</p>}
            </div>
            <div class="mb-3 m-4">
                <label for="Cena" class="form-label">Cena (€)</label>
                <input type="text" className={`form-control ${errors.newPrice ? 'input-error' : ''}`} id="Cena" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} required/>
                {errors.newPrice && <p className='error'>{errors.newPrice}</p>}
            </div>
            <div class="mb-3 m-4">
                <label for="Popis" class="form-label">Popis</label>
                <textarea class="form-control" id="Popis" rows="3" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} required></textarea>
            </div>
            <div class="mb-3 m-4">
                <label for="PocetKs" class="form-label">Počet kusov</label>
                <input type="text" className={`form-control ${errors.newQuant ? 'input-error' : ''}`} value={newQuant} id="PocetKs" onChange={(e) => setNewQuant(e.target.value)} required/>
                {errors.newQuant && <p className='error'>{errors.newQuant}</p>}
            </div>
            



            <div class="mb-3 m-4">
                <label for="HlavnyObrazok" class="form-label">Hlavný obrázok</label>

                {isMainImageChanged ? (
                    <div>
                        <input className={`form-control ${errors.newMainImage ? 'input-error' : ''}`} type="file" id="HlavnyObrazok" onChange={handleNewMainImage} required/>
                        {errors.newMainImage && <p className='error'>{errors.newMainImage}</p>}
                    </div>
                    
                ) : (
                    <div class="row row-cols-2 row-cols-lg-4 row-cols-md-4">
                        <div class="col">
                            <div class="card h-100 col-lg-8 col-10">
                                <img loading="lazy" src={`${baseUrl}${mainImage.cesta}`} class="card-img-top h-100 img-fluid" alt={id + mainImage.cesta}/>

                                <div class="card-body text-center">
                                    <button className='btn btn-danger' onClick={() => setIsMainImageChanged(true)}>
                                        Zmazať
                                    </button>
                                    
                                </div>
                            </div>
                        </div>

                    </div>
                    
                )}
            </div>
            

            


            <div class="mb-3 m-4">
                <label class="form-label">Ďalšie obrázky</label>

                <div class="container-fluid">
                    <div class="row">
                        <div class="row row-cols-lg-6 row-cols-2 row-cols-md-4">

                            {otherImages.map((image) => (
                                        <div class="col mb-4">
                                        <div class="card h-100">
                                            
                                            <img loading="lazy" src={`${baseUrl}${image.cesta}`} class="card-img-top h-100 img-fluid" alt={id + image.cesta}
                                            style={{
                                                opacity: selectedIds.includes(image.id) ? 0.2 : 1,
                                                transition: 'opacity 0.3s ease',
                                              }}/>
                                            <div class="card-body text-center">

                                                {selectedIds.includes(image.id) ? (
                                                    <button className='btn btn-success' onClick={() => handleSelectedIdsChange(image.id)}>
                                                        Späť
                                                    </button>
                                                ) : (
                                                <button className='btn btn-danger' onClick={() => handleSelectedIdsChange(image.id)}>
                                                    Zmazať
                                                </button>
                                                )}
                                                

                                            </div>
                                        </div>
                                    </div>
                            ))}
                            
                                

                        </div>
                    </div>
                </div>
                


                <input class="form-control" type="file" id="DalsieObrazky" onChange={handleOtherImagesChange} multiple style={{ display: 'none' }}/>
                <label
                    className="row m-1"
                    htmlFor="DalsieObrazky"
                    style={{
                    cursor: 'pointer',
                    padding: '10px',
                    background: 'gray',
                    color: 'white',
                    borderRadius: '5px',
                    }}
                >
                    Vybrať ďalšie súbory
                </label>

                <div>
                    {newOtherImages.map((image, index) => (
                    <div key={index} style={{ marginTop: '10px' }}>
                        <span>{image.name}</span>
                        <button className='btn btn-danger' onClick={() => handleRemoveOtherImage(index)} style={{ marginLeft: '10px' }}>
                            Odstrániť
                        </button>
                    </div>
                    ))}
                </div>
            </div>

            <div class="mb-3 m-4">
                <button class="btn btn-primary" onClick={handleSubmit}>
                    Uložiť
                </button>
                <Link to='/katalog' className='no-decoration-text'>
                    <button class="btn btn-secondary">
                        Zrušiť
                    </button>
                </Link>
            
            </div>
        </div>
    );
};



export default EditItemForm;
