import React, { useState, useEffect } from 'react';
import { firestore, storage } from './Config/Config.js';
import './loader.css'

const CrudComponent = () => {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [date, setDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editItemId, setEditItemId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [newImage, setNewImage] = useState(null);






  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const snapshot = await firestore.collection('items').get();
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(items);
      } catch (error) {
        console.log('Error while fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };


    fetchData();
  }, []);

  const handleAddItem = async () => {
    try {
      setIsLoading(true);
      if (!title || !description || !image || !date) {
        return;
      }
      setIsImageLoading(true);

      // Upload the image to Firebase Storage
      const storageRef = storage.ref();
      const imageRef = storageRef.child(image.name);
      const uploadTaskSnapshot = await imageRef.put(image);


      // Get the image URL
      const imageUrl = await uploadTaskSnapshot.ref.getDownloadURL();

      // Add the item to Firestore
      const docRef = await firestore.collection('items').add({
        title,
        description,
        imageUrl,
        date,
      });

      const newItemData = { id: docRef.id, title, description, imageUrl, date };
      setData((prevData) => [...prevData, newItemData]);
      setTitle('');
      setDescription('');
      setImage(null);
      setDate('');
    } catch (error) {
      console.log('Error while adding data:', error);
    } finally {
      setIsImageLoading(false);
    }
  };
  const [showReplaceImageModal, setShowReplaceImageModal] = useState(false);
  const [replaceImageItemId, setReplaceImageItemId] = useState('');

  const handleOpenReplaceImageModal = (item) => {
    setReplaceImageItemId(item.id);
    setShowReplaceImageModal(true);
  };

  const handleCloseReplaceImageModal = () => {
    setReplaceImageItemId('');
    setSelectedImage(null);
    setShowReplaceImageModal(false);
  };

  const handleReplaceImage = async () => {
    try {
      if (!newImage) {
        console.log('Please select a new image');
        return;
      }

      setIsImageLoading(true);

      // Replace the image in Firebase Storage
      const storageRef = storage().ref();
      const imageRef = storageRef.child(newImage.name);
      const uploadTaskSnapshot = await imageRef.put(newImage);

      // Get the new image URL
      const imageUrl = await uploadTaskSnapshot.ref.getDownloadURL();

      await firestore.collection('items').doc(replaceImageItemId).update({
        imageUrl,
      });

      setData((prevData) =>
        prevData.map((item) =>
          item.id === replaceImageItemId ? { ...item, imageUrl } : item
        )
      );

      setReplaceImageItemId('');
      setNewImage(null);
      setShowReplaceImageModal(false);
    } catch (error) {
      console.log('Error while replacing image:', error);
    } finally {
      setIsImageLoading(false);
    }
  };


















  const handleEditItem = async () => {
    try {
      setIsLoading(true);
      if (!title || !description || !date) {
        console.log('Please fill in all fields');
        return;
      }

      // Update the item in Firestore
      await firestore.collection('items').doc(editItemId).update({
        title,
        description,
        date,
      });

      // Replace the image if a new image is selected
      if (selectedImage) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(selectedImage.name);
        await imageRef.put(selectedImage);

        const imageUrl = await imageRef.getDownloadURL();

        await firestore.collection('items').doc(editItemId).update({
          imageUrl,
        });
      }

      setData((prevData) =>
        prevData.map((item) =>
          item.id === editItemId ? { ...item, title, description, date } : item
        )
      );

      setTitle('');
      setDescription('');
      setDate('');
      setEditItemId('');
      setSelectedImage(null);
      setShowEditModal(false);
    } catch (error) {
      console.log('Error while editing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      setIsLoading(true);

      await firestore.collection('items').doc(id).delete();
      setData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      console.log('Error while deleting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleOpenEditModal = (item) => {
    setTitle(item.title);
    setDescription(item.description);
    setDate(item.date);
    setEditItemId(item.id);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setEditItemId('');
    setShowEditModal(false);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);



  const isAddButtonDisabled = !title || !description || !image || !date;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>

      <>
        <div className="container">
          <div className="row">
            <div className="col-md-6 mt-3">
              <h3>Add Item</h3>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Upload Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <button
                className="btn btn-success w-100 mt-3"
                onClick={handleAddItem}
                disabled={isAddButtonDisabled}
              >
                Add Item
              </button>
            </div>
            <div className="col-md-6 mt-3">
              <h3>Items</h3>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Image</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                {isImageLoading ? (
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <tbody>

                    {currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.description}</td>
                        <td>{item.date}</td>
                        <td>

                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            style={{ maxWidth: '100px' }}
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => setIsImageLoading(false)}
                          />

                        </td>


                        <td>
                          <button
                            className="btn btn-sm btn-secondary me-2 mt-3"
                            onClick={() => handleOpenEditModal(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger mt-3"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                )}
              </table>
              <nav>
                <ul className="pagination">
                  {data.length > itemsPerPage &&
                    Array(Math.ceil(data.length / itemsPerPage))
                      .fill()
                      .map((_, index) => (
                        <li
                          className={`page-item${currentPage === index + 1 ? ' active' : ''}`}
                          key={index + 1}
                        >
                          <button className="page-link" onClick={() => paginate(index + 1)}>
                            {index + 1}
                          </button>
                        </li>
                      ))}
                </ul>
              </nav>
            </div>
          </div>


          {/* Edit Modal */}
          <div
            className={`modal fade${showEditModal ? ' show' : ''}`}
            style={{ display: showEditModal ? 'block' : 'none' }}
            tabIndex="-1"
            aria-labelledby="editModalLabel"
            aria-hidden={!showEditModal}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="editModalLabel">Edit Item</h5>
                  <button type="button" className="btn-close" onClick={handleCloseEditModal} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Upload Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files[0])}
                    />
                  </div>



                  {/* Replace Image Modal */}
                  <div
                    className={`modal fade${showReplaceImageModal ? ' show' : ''}`}
                    style={{ display: showReplaceImageModal ? 'block' : 'none' }}
                    tabIndex="-1"
                    aria-labelledby="replaceImageModalLabel"
                    aria-hidden={!showReplaceImageModal}
                  >
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="replaceImageModalLabel">Replace Image</h5>
                          <button type="button" className="btn-close" onClick={handleCloseReplaceImageModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label">New Image</label>
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              onChange={(e) => setSelectedImage(e.target.files[0])}
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={handleCloseReplaceImageModal}>Close</button>
                          <button type="button" className="btn btn-primary" onClick={handleReplaceImage}>Replace Image</button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>Close</button>
                  <button type="button" className="btn btn-primary" onClick={handleEditItem}>Save changes</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </>



    </>


  );
};

export default CrudComponent;
