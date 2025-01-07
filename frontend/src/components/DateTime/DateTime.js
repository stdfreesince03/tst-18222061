import React from 'react';

DateTime.defaultProps = {
    date: new Date().toISOString(),
    options: {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    },
};

export default function DateTime({ date, options }) {
    const {
        weekday = 'short',
        year = 'numeric',
        month = 'long',
        day = 'numeric',
        hour = 'numeric',
        minute = 'numeric',
        second = 'numeric',
    } = options || {}; // Use default values if options is undefined

    const currentLocale = new Intl.DateTimeFormat().resolvedOptions().locale;

    const getDate = () =>
        new Intl.DateTimeFormat(currentLocale, {
            year,
            month,
            weekday,
            day,
            hour,
            minute,
            second,
        }).format(new Date(date));

    return <>{getDate()}</>;
}
