import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../App.css';
import DraftCard from '../components/DraftCard.jsx'
import SubmittedDraftCard from '../components/SubmittedDraftCard.jsx'

function AllDrafts() {
    const [drafts, setDrafts] = useState([]);
    const { user } = useUser();

    const activeDrafts = drafts.filter(d => d.status === 'draft');
    const submittedDrafts = drafts.filter(d => d.status !== 'draft');

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const response = await fetch(`/api/draft?userId=${user?.id}`);

                const data = await response.json();
                setDrafts(data.data);
            } catch (error) {
                console.error('Error loading drafts:', error);
            }
        };

        fetchDrafts();
    }, []);

    return (
        <div className="w-full items-center flex flex-col gap-y-4 self-start mt-10">
            {activeDrafts.map((draft) => (
                <DraftCard key={draft._id} draft={draft} />
            ))}
            <div className="w-full items-center flex flex-col gap-y-4">
                <h1 className="text-4xl font-bold text-left w-full p-4">Submitted</h1>
                {submittedDrafts.map((draft) => (
                    <SubmittedDraftCard key={draft._id} draft={draft} />
                ))}
            </div>
        </div>
    );
}

export default AllDrafts;