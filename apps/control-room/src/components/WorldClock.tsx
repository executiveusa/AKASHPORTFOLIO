'use client';

import React, { useState, useEffect } from 'react';

const cities = [
    { name: 'Mexico City', tz: 'America/Mexico_City', label: 'Local' },
    { name: 'Puerto Rico', tz: 'America/Puerto_Rico' },
    { name: 'Spain', tz: 'Europe/Madrid' },
    { name: 'India', tz: 'Asia/Kolkata' },
    { name: 'Seattle', tz: 'America/Los_Angeles' },
];

export default function WorldClock() {
    const [times, setTimes] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const updateTimes = () => {
            const newTimes: { [key: string]: string } = {};
            cities.forEach((city) => {
                newTimes[city.name] = new Intl.DateTimeFormat('en-US', {
                    timeZone: city.tz,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                }).format(new Date());
            });
            setTimes(newTimes);
        };

        updateTimes();
        const interval = setInterval(updateTimes, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {cities.map((city) => (
                <div key={city.name} className="flex flex-col items-center justify-center p-2">
                    <span className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-bold">
                        {city.name} {city.label && <span className="text-cyan-500">[{city.label}]</span>}
                    </span>
                    <span className="text-xl font-mono text-zinc-800 dark:text-zinc-200">
                        {times[city.name] || '--:--:--'}
                    </span>
                </div>
            ))}
        </div>
    );
}
