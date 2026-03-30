import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@arco-design/web-react';
import { ArrowUp, Play, Magic, Fill, CodeOne, Share, SocialMedia } from '@icon-park/react';
import { useTranslation } from 'react-i18next';

const OutcomeHome: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [input, setInput] = useState('');

    const outcomes = [
        {
            title: 'Generate Content',
            description: 'Draft the next chapter of your story script.',
            icon: <Magic theme='filled' size='24' fill='#2C7FFF' />,
            prompt: 'Draft a new story script for my sci-fi series.'
        },
        {
            title: 'Schedule Socials',
            description: 'Automate your presence across all platforms.',
            icon: <SocialMedia theme='filled' size='24' fill='#FF9900' />,
            prompt: 'Schedule a week of social media posts for Kupuri Media.'
        },
        {
            title: 'Analyze Leads',
            description: 'Discover new opportunities from your data.',
            icon: <Fill theme='filled' size='24' fill='#00B42A' />,
            prompt: 'Summarize the latest lead generation reports.'
        },
        {
            title: 'Code Assist',
            description: 'Optimize and debug your agentic logic.',
            icon: <CodeOne theme='filled' size='24' fill='#7583B2' />,
            prompt: 'Debug the tool execution layer in Synthia 3.0.'
        }
    ];

    return (
        <div className='flex flex-col items-center justify-center min-h-full px-24px pb-64px animate-fade-in'>
            <div className='max-w-800px w-full text-center mb-48px'>
                <h1 className='text-48px md:text-64px font-serif font-semibold tracking-tighter text-black mb-16px leading-tight'>
                    Now your Agent can...
                </h1>
                <p className='text-20px text-[#86909C] max-w-600px mx-auto leading-relaxed'>
                    Synthia 3.0 is your autonomous growth engine. Start with an outcome or ask anything below.
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-20px w-full max-w-900px mb-64px'>
                {outcomes.map((outcome, index) => (
                    <div
                        key={index}
                        className='outcome-card p-24px hover:scale-102 transition-transform shadow-premium'
                        onClick={() => setInput(outcome.prompt)}
                    >
                        <div className='mb-16px'>{outcome.icon}</div>
                        <h3 className='text-20px font-serif font-semibold mb-8px'>{outcome.title}</h3>
                        <p className='text-14px text-[#86909C]'>{outcome.description}</p>
                    </div>
                ))}
            </div>

            <div className='w-full max-w-700px relative'>
                <div className='p-8px bg-white/80 backdrop-blur-md rounded-24px border border-[#F0F0F0] shadow-premium flex items-center gap-12px'>
                    <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        className='!border-none !bg-transparent !shadow-none text-16px flex-1'
                        placeholder='Ask Synthia to do anything...'
                        value={input}
                        onChange={setInput}
                        onPressEnter={(e) => {
                            if (e.shiftKey) return;
                            e.preventDefault();
                            // In a real app, this would trigger handleSend
                            navigate(`/conversation/new?q=${encodeURIComponent(input)}`);
                        }}
                    />
                    <Button
                        shape='circle'
                        type='primary'
                        className='!w-48px !h-48px !rounded-20px'
                        icon={<ArrowUp theme='filled' size='20' fill='white' strokeWidth={4} />}
                        onClick={() => navigate(`/conversation/new?q=${encodeURIComponent(input)}`)}
                    />
                </div>
                <div className='mt-16px flex items-center justify-center gap-12px text-12px text-[#86909C]'>
                    <span className='flex items-center gap-4px'><Play theme='filled' size='12' /> Real-time Execution</span>
                    <span className='flex items-center gap-4px'><Share theme='filled' size='12' /> Social Sync On</span>
                </div>
            </div>
        </div>
    );
};

export default OutcomeHome;
