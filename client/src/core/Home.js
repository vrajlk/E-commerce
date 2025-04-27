import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { getProducts } from './apiCore';
import Card from './Card';
import Search from './Search';
import 'fontsource-roboto';
import Copyright from './Copyright';

const Home = () => {
  const [productsBySell, setProductsBySell] = useState([]);
  const [productsByArrival, setProductsByArrival] = useState([]);
  const [error, setError] = useState(''); // Changed to string for simpler error display

  const loadProductsBySell = async () => {
    try {
      const data = await getProducts('sold');
      console.log('Products by sell response:', data); // Debug
      if (!data) {
        setError('No response from server for best sellers');
        setProductsBySell([]);
        return;
      }
      if (data.error) {
        setError(data.error);
        setProductsBySell([]);
      } else {
        setProductsBySell(data || []);
      }
    } catch (error) {
      console.error('Error loading products by sell:', error);
      setError('Failed to load best sellers');
      setProductsBySell([]);
    }
  };

  const loadProductsByArrival = async () => {
    try {
      const data = await getProducts('createdAt');
      console.log('Products by arrival response:', data); // Debug
      if (!data) {
        setError('No response from server for new arrivals');
        setProductsByArrival([]);
        return;
      }
      if (data.error) {
        setError(data.error);
        setProductsByArrival([]);
      } else {
        setProductsByArrival(data || []);
      }
    } catch (error) {
      console.error('Error loading products by arrival:', error);
      setError('Failed to load new arrivals');
      setProductsByArrival([]);
    }
  };

  useEffect(() => {
    loadProductsByArrival();
    loadProductsBySell();
  }, []);

  const showError = () => (
    error && (
      <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
        {error}
      </div>
    )
  );

  return (
    <Layout
      title='Home page'
      description='MERN E-commerce App'
      className='container-fluid'
    >
      <Search />
      <div className='row'>
        <div className='col-md-1'></div>
        <div className='col-md-10'>
          {showError()}
          <h2 className='mb-2'>New Arrivals</h2>
          <div className='row'>
            {productsByArrival.length > 0 ? (
              productsByArrival.map((product, i) => (
                <div key={i} className='col-xl-4 col-lg-6 col-md-6 col-sm-12'>
                  <Card product={product} />
                </div>
              ))
            ) : (
              <p>No new arrivals available</p>
            )}
          </div>

          <h2 className='mb-2 mt-4'>Best Sellers</h2>
          <div className='row'>
            {productsBySell.length > 0 ? (
              productsBySell.map((product, i) => (
                <div key={i} className='col-xl-4 col-lg-6 col-md-6 col-sm-12'>
                  <Card product={product} />
                </div>
              ))
            ) : (
              <p>No best sellers available</p>
            )}
          </div>
        </div>
        <div className='col-md-1'></div>
      </div>
      <Copyright />
    </Layout>
  );
};

export default Home;