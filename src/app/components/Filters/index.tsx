import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-datapicker.css';
import './filters.css';
import useZeroGlobalStore from '@/store/useZeroGlobalStore';

interface FiltersProps {
    setFilter: (filter: string) => void;
}

Modal.setAppElement('body');

type Option = {
    label: string;
    value: string;
};

const createOption = (label: string, value: string): Option => ({ label, value });

const options: Option[] = [
    createOption('Today', 'today'),
    createOption('Yesterday', 'yesterday'),
    createOption('Last 7 days', '7d'),
    createOption('Last 30 days', '30d'),
    createOption('Last 90 days', '90d'),
    createOption('Last Year', '365d'),
    createOption('Last Week', 'last_week'),
    createOption('Custom date range', 'custom')
];

const Filters: React.FC<FiltersProps> = ({ setFilter }) => {
    const { filter } = useZeroGlobalStore();
    const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const [startDate, endDate] = customDateRange;
    const [selectedOption, setSelectedOption] = useState<string>(filter);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const handleButtonClick = (value: string) => {
        setSelectedOption(value);
        localStorage.setItem('selectedOption', value);
        if (value !== 'custom') {
            setFilter(value);
            setCustomDateRange([null, null]);
        } else {
            setModalIsOpen(true);
        }
    };

    useEffect(() => {
        if (selectedOption && selectedOption !== 'custom' && selectedOption !== filter) {
            setFilter(selectedOption);
        }
    }, [selectedOption, setFilter, filter]);

    useEffect(() => {
        if (selectedOption === 'custom' && startDate && endDate) {
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');
            setFilter(`custom_${formattedStartDate}_${formattedEndDate}`);
            setModalIsOpen(false);
        }
    }, [startDate, endDate, selectedOption, setFilter]);

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        setCustomDateRange(dates);
    };

    return (
        <div className="filters">
            <div className="filter-buttons">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleButtonClick(option.value)}
                        className={`filter-button ${selectedOption === option.value ? 'active' : ''}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Select Custom Date Range"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="modal-content">
                    <h2>Select Custom Date Range</h2>
                    <div className="datepicker-container">
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                        />
                    </div>
                    <button onClick={closeModal} className="modal-close-button">Apply</button>
                </div>
            </Modal>
        </div>
    );
};

export default Filters;
