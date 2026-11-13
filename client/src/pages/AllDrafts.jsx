import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../App.css';
import DraftCard from '../components/DraftCard.jsx'
import SubmittedDraftCard from '../components/SubmittedDraftCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function AllDrafts() {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    const activeDrafts = drafts.filter(d => d.status === 'draft');
    const submittedDrafts = drafts.filter(d => d.status !== 'draft');

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                setLoading(true)
                const response = await fetch(`/api/draft?userId=${user?.id}`);

                const data = await response.json();
                setDrafts(data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error loading drafts:', error);
            }
        };

        fetchDrafts();
    }, []);

    return (
        <div className="w-full items-center flex flex-col gap-y-4 self-start mt-10">
            {activeDrafts?.length > 0
                ?
                <>
                    {
                        activeDrafts.map((draft) => (
                            <DraftCard key={draft._id} draft={draft} />
                        ))
                    }
                </>
                :
                <div className="text-2xl">
                    No active drafts
                </div>
            }
            {submittedDrafts?.length > 0
                ?
                <div className="w-full items-center flex flex-col gap-y-4 pl-8">

                    <h1 className="text-4xl font-bold text-left w-full p-4">Submitted</h1>
                    {submittedDrafts.map((draft) => (
                        <SubmittedDraftCard key={draft._id} draft={draft} />
                    ))}
                </div>
                :
                <div className="text-2xl">
                    No submitted drafts
                </div>
            }
            {loading &&
                <LoadingSpinner />
            }
        </div>
    );
}

export default AllDrafts;