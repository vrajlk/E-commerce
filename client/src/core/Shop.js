import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from './Card';
import { getCategories, getFilteredProducts } from './apiCore';
import Checkbox from './Checkbox';
import RadioBox from './RadioBox';
import { makeStyles } from '@material-ui/core/styles';
import Search from './Search';
import { prices } from './fixedPrices';
import Copyright from './Copyright';

const useStyles = makeStyles((theme) => ({
  btn: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 20px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  },
}));

const Shop = () => {
  const [myFilters, setMyFilters] = useState({
    filters: { category: [], price: [] },
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(6);
  const [skip, setSkip] = useState(0);
  const [size, setSize] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);

  const init = async () => {
    try {
      const data = await getCategories();
      console.log('Categories response:', data); // Debug
      if (!data) {
        setError('No response from server for categories');
        setCategories([]);
        return;
      }
      if (data.error) {
        setError(data.error);
        setCategories([]);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      setCategories([]);
    }
  };

  const loadFilteredResults = async (newFilters) => {
    try {
      const data = await getFilteredProducts(skip, limit, newFilters);
      console.log('Filtered products response:', data); // Debug
      if (!data) {
        setError('No response from server for filtered products');
        setFilteredResults([]);
        setSize(0);
        return;
      }
      if (data.error) {
        setError(data.error);
        setFilteredResults([]);
        setSize(0);
      } else {
        setFilteredResults(data.data || []);
        setSize(data.size || 0);
        setSkip(0);
      }
    } catch (error) {
      console.error('Error loading filtered products:', error);
      setError('Failed to load filtered products');
      setFilteredResults([]);
      setSize(0);
    }
  };

  const loadMore = async () => {
    const toSkip = skip + limit;
    try {
      const data = await getFilteredProducts(toSkip, limit, myFilters.filters);
      console.log('Load more products response:', data); // Debug
      if (!data) {
        setError('No response from server for more products');
        return;
      }
      if (data.error) {
        setError(data.error);
      } else {
        setFilteredResults([...filteredResults, ...(data.data || [])]);
        setSize(data.size || 0);
        setSkip(toSkip);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      setError('Failed to load more products');
    }
  };

  const classes = useStyles();

  const loadMoreButton = () => {
    return (
      size > 0 &&
      size >= limit && (
        <Button onClick={loadMore} variant='contained' className={classes.btn}>
          Load more
        </Button>
      )
    );
  };

  const showError = () => (
    error && (
      <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
        {error}
      </div>
    )
  );

  useEffect(() => {
    init();
    loadFilteredResults(myFilters.filters);
  }, []);

  const handleFilters = (filters, filterBy) => {
    const newFilters = { ...myFilters };
    newFilters.filters[filterBy] = filters;

    if (filterBy === 'price') {
      let priceValues = handlePrice(filters);
      newFilters.filters[filterBy] = priceValues;
    }
    loadFilteredResults(newFilters.filters);
    setMyFilters(newFilters);
  };

  const handlePrice = (value) => {
    const data = prices;
    let array = [];

    for (let key in data) {
      if (data[key]._id === parseInt(value)) {
        array = data[key].array;
      }
    }
    return array;
  };

  return (
    <Layout
      title='Shop page'
      description='Search and find books'
      className='container-fluid'
    >
      <Search />
      <div className='row'>
        <div className='col-md-3'>
          {showError()}
          <h4>Filter by categories</h4>
          <ul>
            <Checkbox
              categories={categories}
              handleFilters={(filters) => handleFilters(filters, 'category')}
            />
          </ul>

          <h4>Filter by price range</h4>
          <div>
            <RadioBox
              prices={prices}
              handleFilters={(filters) => handleFilters(filters, 'price')}
            />
          </div>
        </div>

        <div className='col-md-9'>
          <h2 className='mb-2'>Products</h2>
          <div className='row'>
            {filteredResults.length > 0 ? (
              filteredResults.map((product, i) => (
                <div key={i} className='col-xl-4 col-lg-6 col-md-12 col-sm-12'>
                  <Card product={product} />
                </div>
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>
          <hr />
          {loadMoreButton()}
        </div>
      </div>
      <Copyright />
    </Layout>
  );
};

export default Shop;