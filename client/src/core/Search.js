import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import { getCategories, list } from './apiCore';
import Card from './Card';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  tField: {
    width: 800,
    marginTop: 2,
  },
  root: {
    '& > *': {
      margin: theme.spacing(2),
    },
  },
}));

const Search = () => {
  const [data, setData] = useState({
    categories: [],
    category: '',
    search: '',
    results: [],
    searched: false,
  });
  const [error, setError] = useState(''); // Added error state

  const { categories, category, search, results, searched } = data;

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      console.log('Categories response:', response); // Debug
      if (!response) {
        setError('No response from server for categories');
        setData({ ...data, categories: [] });
        return;
      }
      if (response.error) {
        setError(response.error);
        setData({ ...data, categories: [] });
      } else {
        setData({ ...data, categories: response || [] });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
      setData({ ...data, categories: [] });
    }
  };

  const searchData = async () => {
    if (search) {
      try {
        const response = await list({ search: search || undefined, category: category });
        console.log('Search response:', response); // Debug
        if (!response) {
          setError('No response from server for search');
          setData({ ...data, results: [], searched: true });
          return;
        }
        if (response.error) {
          setError(response.error);
          setData({ ...data, results: [], searched: true });
        } else {
          setData({ ...data, results: response || [], searched: true });
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setError('Failed to search products');
        setData({ ...data, results: [], searched: true });
      }
    }
  };

  const searchSubmit = (e) => {
    e.preventDefault();
    searchData();
  };

  const handleChange = (name) => (event) => {
    setData({ ...data, [name]: event.target.value, searched: false });
    setError(''); // Clear error on input change
  };

  const searchMessage = (searched, results) => {
    if (searched && results.length > 0) {
      return `Found ${results.length} products`;
    }
    if (searched && results.length < 1) {
      return `Search: No products found`;
    }
  };

  const showError = () => (
    error && (
      <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
        {error}
      </div>
    )
  );

  const searchedProducts = (results = []) => {
    return (
      <div className='row'>
        <div className='col-md-1'></div>
        <div className='col-md-10'>
          {showError()}
          <h2 className='mt-4 mb-4 text-center'>{searchMessage(searched, results)}</h2>
          <div className='row'>
            {results.map((product, i) => (
              <div className='col-md-4 mb-3' key={i}>
                <Card product={product} />
              </div>
            ))}
          </div>
        </div>
        <div className='col-md-1'></div>
      </div>
    );
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const classes = useStyles();

  const searchForm = () => (
    <form onSubmit={searchSubmit} className={classes.root}>
      <span className='input-group-text'>
        <div className='input-group input-group-lg'>
          <div className='input-group-prepend'>
            <FormControl className={classes.formControl}>
              <InputLabel id='demo-simple-select-helper-label'>
                Select
              </InputLabel>
              <Select
                labelId='demo-simple-select-placeholder-label-label'
                id='demo-simple-select-placeholder-label'
                value={category}
                onChange={handleChange('category')}
                displayEmpty
                className={classes.selectEmpty}
              >
                <MenuItem value='All'>
                  <em>All</em>
                </MenuItem>
                {categories.length > 0 ? (
                  categories.map((c, i) => (
                    <MenuItem key={i} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No categories available</MenuItem>
                )}
              </Select>
            </FormControl>
          </div>

          <TextField
            onChange={handleChange('search')}
            id='outlined-basic'
            label={<span><SearchIcon /> Search by name</span>}
            variant='outlined'
            className={classes.tField}
            autoComplete='off'
          />

          <div className='ml-3 mt-2' style={{ border: 'none' }}>
            <Button ml={2} variant='contained' color='primary' type='submit'>
              Search
            </Button>
          </div>
        </div>
      </span>
    </form>
  );

  return (
    <div className='row'>
      <div className='container mb-3'>{searchForm()}</div>
      <div className='container-fluid mb-3'>{searchedProducts(results)}</div>
    </div>
  );
};

export default Search;