import React, { useState} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import getAuthHeader from '../hooks/AuthHeader';

const AddItemForm = () => {

        const navigate = useNavigate();
        const authHeader = getAuthHeader();
        const handleTitle = (text) => {
            document.title = text;
        };
    
        const [name, setName] = useState('');
        const [desc, setDesc] = useState('');
        const [price, setPrice] = useState('');
        const [quant, setQuant] = useState('');
        const [errors, setErrors] = useState({});

        const [selectedMainImage, setSelectedMainImage] = useState(null);
        const [selectedOtherImages, setSelectedOtherImages] = useState([]);

        const handleNazovChange = (e) => setName(e.target.value);
        const handlePopisChange = (e) => setDesc(e.target.value);
        const handleCenaChange = (e) => setPrice(e.target.value);
        const handlePocetKsChange = (e) => setQuant(e.target.value);

        const handleImageChange = (e) => {
            const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!validImageTypes.includes(e.target.files[0].type)) {
                e.target.value = '';
                setSelectedMainImage(null);
                alert('Obrázok musí byť type png/jpg/jpeg!');
                return;
            }

            setSelectedMainImage(e.target.files[0]);
        };

        const handleOtherImagesChange = (e) => {
            const newImages = Array.from(e.target.files);
            setSelectedOtherImages((prevImages) => [...prevImages, ...newImages]);
        };

        const handleRemoveOtherImage = (index) => {
            setSelectedOtherImages((prevFiles) => prevFiles.filter((_, i) => i !== index));
        };

        const validate = () => {
            const errors = {};

            if (!name.trim())
            {
                errors.name = "Názov nesmie byť prázdny!";
            }
            if (!price || isNaN(Number(price)))
            {
                errors.price = "Cena musí byť číslo!";
            } else if (Number(price) <= 0) 
            {
                errors.price = "Cena musí byť väčšia ako 0!";
            }
            if (!quant || !Number.isInteger(Number(quant))) {
                errors.quant = "Počet kusov musí byť celé číslo!";
            } else if (Number(quant) < 0) {
                errors.quant = "Počet kusov musí byť 0 alebo viac!";
            }

            if (!selectedMainImage)
            {
                errors.mainImage = "Hlavný obrázok musí byť zvolený!"
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
            formData.append('nazov', name);
            formData.append('popis', desc);
            formData.append('cena', price);
            formData.append('pocet_ks', quant);
            formData.append('mainImage', selectedMainImage);
            for (const otherImage of selectedOtherImages)
            {
                formData.append('otherImages[]', otherImage);
            }

            try {
                await axios.post('/api/polozka/add', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        ...authHeader.headers
                    },
                });
            } catch (error) {
                console.error('Chyba pri pridávaní položky:', error);
                alert('Chyba pri pridávaní položky.');
            }

            navigate('/katalog');
        };


     return (
        <div>
            <div class="mb-3 m-4">
                <label for="Nazov" class="form-label">Názov</label>
                <input type="text" className={`form-control ${errors.name ? 'input-error' : ''}`} id="Nazov" value={name} onChange={handleNazovChange} required/>
                {errors.name && <p className='error'>{errors.name}</p>}
            </div>
            <div class="mb-3 m-4">
                <label for="Cena" class="form-label">Cena (€)</label>
                <input type="text" className={`form-control ${errors.price ? 'input-error' : ''}`} id="Cena" placeholder="9.99" value={price} onChange={handleCenaChange} required/>
                {errors.price && <p className='error'>{errors.price}</p>}
            </div>
            <div class="mb-3 m-4">
                <label for="Popis" class="form-label">Popis</label>
                <textarea class="form-control" id="Popis" rows="3" value={desc} onChange={handlePopisChange} required></textarea>
            </div>
            <div class="mb-3 m-4">
                <label for="PocetKs" class="form-label">Počet kusov</label>
                <input type="text" className={`form-control ${errors.quant ? 'input-error' : ''}`} id="PocetKs" value={quant} onChange={handlePocetKsChange} required/>
                {errors.quant && <p className='error'>{errors.quant}</p>}
            </div>
            
            <div class="mb-3 m-4">
                <label for="HlavnyObrazok" class="form-label">Hlavný obrázok</label>
                <input className={`form-control ${errors.mainImage ? 'input-error' : ''}`} type="file" id="HlavnyObrazok" onChange={handleImageChange} required/>
                {errors.mainImage && <p className='error'>{errors.mainImage}</p>}
            </div>
            
            <div class="mb-3 m-4">
                <label class="form-label">Ďalšie obrázky</label>
                <input class="form-control" type="file" id="DalsieObrazky" multiple onChange={handleOtherImagesChange} style={{ display: 'none' }}/>
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
                    Vybrať súbory
                </label>
                <div>
                    {selectedOtherImages.map((image, index) => (
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
                <button class="btn btn-primary" onClick={() => { handleTitle('WearWave | Katalóg'); handleSubmit(); }}>
                    Pridať
                </button>
                <Link to='/katalog' className='no-decoration-text'>
                    <button class="btn btn-secondary">
                        Zrušiť
                    </button>
                </Link>
            </div>
        </div>
    )
};

export default AddItemForm;
