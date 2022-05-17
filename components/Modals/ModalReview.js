import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '@/components/ui/Input';
import TextArea from 'rc-textarea';
import Rating from '@material-ui/lab/Rating';
import { makeStyles } from '@material-ui/core/styles';
import { supabase } from '@/utils/supabase-client';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    '& > * + *': {
      marginTop: theme.spacing(1)
    }
  }
}));

export default function ModalReview({ setOpenReviewModal, party_member_id, changePlayerStatus }) {
  const [reviewWell, setReviewWell] = useState(null);
  const [reviewBetter, setReviewBetter] = useState(null);
  const [reviewHelpful, setReviewHelpful] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoaded, setReviewLoaded] = useState(null);
  const [saving, setSaving] = useState(null);
  const classes = useStyles();

  // load review
  useEffect(() => {
    loadReview();
  }, []);

  async function loadReview() {
    try {
      const { data, error } = await supabase
        .from('party_review')
        .select('*')
        .eq('party_member', party_member_id)
        .single();

      if (data) {
        setReviewWell(data.done_well);
        setReviewBetter(data.do_better);
        setReviewHelpful(data.be_helpful);
        setReviewRating(data.party_rating);
      }

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      // alert(error.message)
    } finally {
      setReviewLoaded(true);
    }
  }

  // save review
  async function saveReview(done_well, do_better, be_helpful, party_rating) {
    setSaving(true);

    try {
      const user = supabase.auth.user();

      let { data, error } = await supabase
        .from('party_review')
        .upsert({
          party_member: party_member_id,
          done_well: done_well,
          do_better: do_better,
          be_helpful: be_helpful,
          party_rating: party_rating,
          updated_at: new Date()
        })
        .eq('party_member', party_member_id);
    } catch (error) {
     // alert(error.message);
     console.log(error.message);
    } finally {
      setSaving(false);
      changePlayerStatus('Reviewing')
      setOpenReviewModal(false);
    }
  }

  return (
    <>
      <div className="animate-fade-in h-screen flex justify-center">
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div
            className="opacity-50 fixed inset-0 z-40 bg-black"
            onClick={() => setOpenReviewModal(false)}
          ></div>
          <div className="relative w-auto my-6 mx-auto max-w-xl max-h-screen z-50">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t bg-gradient-to-r from-emerald-500 to-blue-500">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  Post-Challenge Reflection
                </h3>
              </div>
              {/*body*/}
              <div className="relative p-6 text-primary-2 00">
                <div className="text-center">
                  <p className="text-xl text-primary-2 font-semibold">
                    Make your next journey amazing.
                  </p>
                </div>
                {reviewLoaded ? (
                  <div className="grid grid-cols-2 gap-5 mt-5">
                    <div className="col-span-2">
                      <div className="mb-2 font-semibold">
                        What did I do well?
                      </div>
                      <TextArea
                        className="text-lg font-semibold rounded py-2 px-3 w-full transition duration-150 ease-in-out border border-accents-3"
                        variant="dailies"
                        type="text"
                        disabled={saving}
                        value={reviewWell || ''}
                        rows={3}
                        onChange={(e) => {
                          setReviewWell(e.target.value);
                        }}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="mb-2 font-semibold">
                        What could I have done better?
                      </div>
                      <TextArea
                        className="text-lg font-semibold rounded py-2 px-3 w-full transition duration-150 ease-in-out border border-accents-3"
                        variant="dailies"
                        type="text"
                        disabled={saving}
                        value={reviewBetter || ''}
                        rows={3}
                        onChange={(e) => {
                          setReviewBetter(e.target.value);
                        }}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="mb-2 font-semibold">
                      I would find it helpful in my next challenge if others can...
                      </div>
                      <TextArea
                        className="text-lg font-semibold rounded py-2 px-3 w-full transition duration-150 ease-in-out border border-accents-3"
                        variant="dailies"
                        type="text"
                        disabled={saving}
                        value={reviewHelpful || ''}
                        rows={3}
                        onChange={(e) => {
                          setReviewHelpful(e.target.value);
                        }}
                        disabled={saving}
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="mb-2 font-semibold text-center">
                        How did you like this party experience?
                      </div>
                      <div className={`${classes.root} items-center`}>
                        <Rating
                          name="size-large"
                          defaultValue={reviewRating ? reviewRating : 5}
                          size="large"
                          disabled={saving}
                          onChange={(event, e) => {
                            setReviewRating(e);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="w-40 max-w-xs h-6 bg-gray-600 rounded animate-pulse mb-3" />
                    <div className="mx-auto max-w-sm sm:max-w-lg h-24 bg-gray-600 rounded animate-pulse mb-6" />
                    <div className="w-40 max-w-xs h-6 bg-gray-600 rounded animate-pulse mb-3" />
                    <div className="mx-auto max-w-sm sm:max-w-lg h-24 bg-gray-600 rounded animate-pulse mb-6" />
                    <div className="w-40 max-w-xs h-6 bg-gray-600 rounded animate-pulse mb-3" />
                    <div className="mx-auto max-w-sm sm:max-w-lg h-24 bg-gray-600 rounded animate-pulse mb-6" />
                  </div>
                )}
              </div>
              {/* <img src="img/default_avatar.png" height="auto" className="w-3/4 mx-auto pb-2" /> */}
              {/*footer*/}
              <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
                <div className="text-center mx-auto">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setOpenReviewModal(false)}
                  >
                    Close
                  </button>
                  <Button
                    variant="prominent"
                    className="text-md font-semibold text-emerald-600"
                    onClick={() => saveReview(reviewWell, reviewBetter, reviewHelpful, reviewRating)}
                    disabled={!reviewLoaded || saving || !reviewWell || !reviewBetter || !reviewHelpful || !reviewRating}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
