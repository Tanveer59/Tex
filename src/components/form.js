import { Formik, Field, Form } from 'formik';
import itemsApiResponse from './api.ob';
import { useState, useEffect, useRef } from 'react';
import { FaAngleDown } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const groupItemsByCategory = (items) => {
    const categories = {};
    const uncategorized = [];
  
    items.forEach(item => {
      if (item.category) {
        if (!categories[item.category.id]) {
          categories[item.category.id] = {
            id: item.category.id,
            name: item.category.name,
            items: []
          };
        }
        categories[item.category.id].items.push(item);
      } else {
        uncategorized.push(item);
      }
    });
  
    return { categories: Object.values(categories), uncategorized };
};

const findMatchingItems = (itemsApiResponse, keyword, percentage) => {
    const percentageValue = percentage ? parseFloat(percentage.replace('%', '')) / 100 : null;
  
    return itemsApiResponse.filter(item => {
      const keywordMatch = Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.includes(keyword);
        } else if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(subValue => typeof subValue === 'string' && subValue.includes(keyword));
        }
        return false;
      });
  
      const percentageMatch = percentageValue !== null && Object.values(item).some(value => {
        if (typeof value === 'number') {
          return value === percentageValue;
        } else if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(subValue => typeof subValue === 'number' && subValue === percentageValue);
        }
        return false;
      });
  
      return keywordMatch || percentageMatch;
    });
};

const Basic = () => {
    const [selectedCheckbox, setSelectedCheckbox] = useState(null);
    const [spasificCheckbox, setSpacific] = useState(null);
    const [keyword, setKeyword] = useState({});
    const [catMedia, setCatMedia] = useState([]);
    const [isOpenCate, setIsOpenCate] = useState(false);
    const [isOpenUnCate, setIsOpenUnCate] = useState(false);
    const [genTime, setGenTime] = useState(true);
    const [checkedItems, setCheckedItems] = useState({});
    const [checkedList, setCheckedList] = useState(0);
    const [entItems, setEntItems] = useState([]);
    const hasMounted = useRef(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setGenTime(false);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let checkList = Object.keys(checkedItems).length; 
        setCheckedList(checkList);
    }, [checkedItems]);
    

    const trackCate = () => {
        setIsOpenCate(!isOpenCate);
    };
    const trackUnCate = () => {
        setIsOpenUnCate(!isOpenUnCate);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
    
        setCheckedItems(prev => {
            if (checked) {
                return {
                    ...prev,
                    [name]: checked,
                };
            } else {

                const { [name]: _, ...rest } = prev;
                return rest;
            }
        });
    };

    

    const selectMulItems = (items) => {
        const newItems = items.reduce((acc, itemName) => {
            acc[itemName] = true;
            return acc;
        }, {});
        setCheckedItems(prev => ({
            ...prev,
            ...newItems
        }));
    }

    

    const { categories, uncategorized } = groupItemsByCategory(itemsApiResponse);

    const handleAddItem = () => {
        let itemVal = ['Bracelets', 'uncategorized'];
    
        // Iterate over categories and collect item names
        categories.forEach(category => {
            category.items.forEach(item => {
                itemVal.push(item.name);
            });
        });
    
        // Collect names from uncategorized items
        const secondVal = uncategorized.map(item => item.name);
    
        // Combine both arrays
        const BulkData = [...itemVal, ...secondVal];
        return BulkData;
    };
    
    useEffect(() => {
        if (hasMounted.current) {
            if (selectedCheckbox) {
                const bulkItems = handleAddItem();
                setEntItems(bulkItems);
                selectMulItems(bulkItems);
            } else {
                setEntItems([]);
                setCheckedItems({});
            }
            console.log("Effect ran. Selected Checkbox:", selectedCheckbox, "Ent Items:", entItems, "Checked Items:", checkedItems);
        } else {
            hasMounted.current = true;
        }
    }, [selectedCheckbox]);

    useEffect(() => {
        if(hasMounted.current){
            if(checkedItems.bracelets){
                console.log('excuted')
                const bulkItems = [];
                categories.forEach(category => {
                    category.items.forEach(item => {
                        bulkItems.push(item.name);
                    })    
                });
                setEntItems(bulkItems);
                selectMulItems(bulkItems);
            }else{
                setEntItems([]);
                setCheckedItems({});
            }
        }

    }, [checkedItems.bracelets]);
    
    


    const handleClick = () => {
        setCatMedia(findMatchingItems(itemsApiResponse, keyword.key, keyword.percentage));
    };

    const handleFormSubmit = (values) => {
        const selectedItems = Object.keys(checkedItems).filter(item => checkedItems[item]);
        Console();
        console.log('Selected items:', selectedItems);
        console.log('Form values:', values);


    // Optionally, clear the selected checkboxes and other states
        setCheckedItems({});
        setSelectedCheckbox(null);
        setSpacific(null);
    };


    const Console = () => {
        // Extract all keys from checkedItems
        let keysToMatch = Object.keys(checkedItems);

        console.log(keysToMatch);
        // Create a new object with only the matching keys
        const filteredItems = itemsApiResponse.filter(item => keysToMatch.includes(item.name));
        
        console.log( {applicable_id: [filteredItems.map(item => item.id)], applied_to:[filteredItems.map(item => item.name)],Rate:[filteredItems.map(item => item.net_quantity)]})
    }
    
    


    return (
        <div className='flex flex-col w-full rounded-sm'>
            <Formik
                initialValues={{ label: '', percentage: '', key: '', Search: '' }}
                validate={values => {
                    const errors = {};
                    if (!values.label) {
                        errors.label = '';
                    }
                    if (!values.percentage) {
                        errors.percentage = '';
                    } else if (isNaN(values.percentage)) {
                        errors.percentage = 'Must be a number';
                    }
                    return errors;
                }}
                onSubmit={handleFormSubmit}
            >
                {({
                    errors,
                    touched,
                    handleSubmit,
                }) => (
                    <Form className='mt-8 w-full relative'  onSubmit={handleSubmit}>
                        <div className='flex w-full gap-2 pl-4'>
                            <Field
                                className='bg-white mb-2 p-3 border w-1/2 outline-none'
                                placeholder='Enter Tex'
                                type="text"
                                name="key"
                            />
                            {errors.label && touched.label && <div>{errors.label}</div>}
                            <Field
                                className='mb-2 p-3 outline-none border w-1/4 placeholder:text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                placeholder='%'
                                type="number"
                                name="percentage"
                            />
                            {errors.percentage && touched.percentage && <div>{errors.percentage}</div>}
                        </div>

                        <div className='mb-4 pl-4 pr-4'>
                            <div className='flex justify-start items-center mt-6'>
                                <Field
                                    className='w-4 h-4 text-[#f16d36] bg-gray-100 dark:ring-offset-[#f16d36] focus:ring-0 dark:bg-[#f16d36] dark:border-[#f16d36]'
                                    type="checkbox"
                                    name="allSelect"
                                    checked={selectedCheckbox === 'allSelect'}
                                    onChange={() => setSelectedCheckbox(
                                        prev => prev === 'allSelect' ? null : 'allSelect')
                                    }
                                />
                                <label htmlFor="allSelect" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apply to all items in collection</label>
                            </div>
                            <div className='flex justify-start items-center mt-2'>
                                <Field
                                    className='w-4 h-4 text-[#f16d36] bg-gray-100 dark:ring-offset-[#f16d36] focus:ring-0 dark:bg-[#f16d36] dark:border-[#f16d36]'
                                    type="checkbox"
                                    name="specific"
                                    checked={spasificCheckbox === 'specific'}
                                    onChange={() => setSpacific(prev => prev === 'specific' ? null : 'specific')}
                                />
                                <label htmlFor="specific" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Apply to specific items</label>
                            </div>
                        </div>

                        <hr className='mt-4 mb-4' />

                        <div className='relative pb-12 pl-4 pr-4' id='main-div'>
                            <Field
                                className='bg-white mb-2 p-3 border w-1/3 outline-none'
                                placeholder={`Search Items`}
                                type="text"
                                name="Search"
                            />
                            <div className={`${genTime ? 'block' : 'hidden'}`}>
                                <p> Generating... </p>
                            </div>

                            <div className={`${genTime ? 'hidden' : 'block'} pt-2`}>
                                {categories.map((category, index) => (
                                    <div key={index}>
                                        <div className='bg-gray-300 p-2 flex justify-between w-full' onClick={trackCate}>
                                            <div>
                                                <label htmlFor={category.name} className="outfit-b ms-2 flex items-center gap-2 text-xl font-medium text-gray-900 dark:text-gray-300">
                                                    <Field
                                                        className='w-4 h-4 text-[#f16d36] bg-gray-100 dark:ring-offset-[#f16d36] focus:ring-0 dark:bg-[#f16d36] dark:border-[#f16d36]'
                                                        type="checkbox"
                                                        value={category.name}
                                                        name={category.name}
                                                        checked={checkedItems[category.name] || false}  // Control the checked state
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    {category.name}
                                                </label>
                                            </div>
                                            {!isOpenCate ? <FaAngleDown className="text-2xl" /> : <RxCross2 className="text-2xl" />}
                                        </div>

                                        {isOpenCate && category.items.map((item, itemIndex) => (
                                            <div className='mt-4 pl-4' key={itemIndex}>
                                                <label htmlFor={item.name} className="outfit-b ms-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    <Field
                                                        className='w-4 h-4 text-[#f16d36] bg-gray-100 dark:ring-offset-[#f16d36] focus:ring-0 dark:bg-[#f16d36] dark:border-[#f16d36]'
                                                        type="checkbox"
                                                        value={item.name}
                                                        name={item.name}
                                                        checked={checkedItems[item.name] || false} 
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    {item.name} 
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <div>
                                    <div className='mt-4'>
                                        <div className='flex justify-between w-full bg-gray-300 p-2' onClick={trackUnCate}>
                                            <div className=''>
                                                <label htmlFor='unCate' className="outfit-b ms-2 flex items-center gap-2 text-xl font-medium text-gray-900 dark:text-gray-300">
                                                    <Field
                                                        className='w-4 h-4 text-[#f16d36] bg-gray-100 dark:ring-offset-[#f16d36] focus:ring-0 dark:bg-[#f16d36] dark:border-[#f16d36]'
                                                        type="checkbox"
                                                        name='unCate'
                                                        value="uncategorized"
                                                    />
                                                    Uncategorized
                                                </label>
                                            </div>
                                            {!isOpenUnCate ? <FaAngleDown className="text-2xl" /> : <RxCross2 className="text-2xl" />}
                                        </div>

                                        {isOpenUnCate && uncategorized.map((item, itemIndex) => (
                                            <div className='mt-4 pl-4' key={itemIndex}>
                                                <ul>
                                                    <li>
                                                        <label htmlFor={item.name} className="outfit-b ms-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                            <Field
                                                                className='w-4 h-4 text-[#f16d36] bg-gray-100 dark:ring-offset-[#f16d36] focus:ring-0 dark:bg-[#f16d36] dark:border-[#f16d36]'
                                                                type="checkbox"
                                                                name={item.name}
                                                                value={item.name}
                                                                checked={checkedItems[item.name] || false} 
                                                                onChange={handleCheckboxChange}
                                                            />
                                                            {item.name}
                                                        </label>
                                                    </li>
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="absolute right-0 mt-4 p-2 mr-4 bg-[#f16d36] rounded text-white"
                                onClick={handleFormSubmit}
                            >
                                {`Apply tax to ${checkedList} item(s)`}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default Basic;
