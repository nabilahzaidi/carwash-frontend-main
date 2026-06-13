import CRForm from '@/components/form/CRForm';
import CRInput from '@/components/form/CRInput';
import CRTextarea from '@/components/form/CRTextarea';
import Loading from '@/components/shared/Loading';
import CARButton from '@/components/ui/CARButton';
import { useGetUserinfoQuery } from '@/redux/features/auths/authApi';
import { useCurrentToken } from '@/redux/features/auths/authSlice';
import { useAddReviewMutation } from '@/redux/features/reviews/reviewsApi';
import { useAppSelector } from '@/redux/hook';
import { verifyToken } from '@/utils/verifyToken';
import { Star, Stars } from 'lucide-react';
import { useState } from 'react';
import Rating from 'react-rating';
import { toast } from 'sonner';

const ReviewForm = () => {
  const [addReview] = useAddReviewMutation();
  const token = useAppSelector(useCurrentToken);
  let user;
  if (token) {
    user = verifyToken(token);
  }
  const userEmail = user?.userEmail || user?.email;
  const { data: userData, isLoading } = useGetUserinfoQuery(userEmail, {
    skip: !userEmail,
  });
  const [rating, setRating] = useState(3);

  if (isLoading) {
    return <><Loading/></>;
  }

  const RatingComponent = Rating as any;

  const handleReviewSubmit = async (data: any) => {
    if (!userData?.data?._id) {
      toast.error('Please sign in to give feedback');
      return;
    }

    // check token expiry and avoid calling API when token is expired
    if (token) {
      try {
        const decoded: any = verifyToken(token);
        if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
          toast.error('Session expired — please sign in again');
          return;
        }
      } catch (e) {
        // if token can't be decoded, avoid calling API
        toast.error('Invalid session — please sign in again');
        return;
      }
    }

    const ratingData = {
      user: userData.data._id,
      feedback: data.feedback,
      rating: rating,
      profileImg:
        data.profileImg ||
        'https://cdn3.pixelcut.app/1/3/profile_picture_1728ecf2bd.jpg',
    };

    try {
      if (import.meta.env.DEV) {
        // debug info to help investigate 401/refresh failures during development
        try {
          // eslint-disable-next-line no-console
          console.debug('Review submit debug', {
            token,
            userId: userData?.data?._id,
            ratingData,
            decoded: token ? verifyToken(token) : null,
          });
        } catch (e) {
          // ignore
        }
      }

      const res = await addReview(ratingData).unwrap();

      if (res?.success) {
        toast.success('Thanks for your feedback!');
        setRating(3);
      } else {
        toast.error(res?.message || 'Failed to submit review');
      }
    } catch (err: any) {
      const message = err?.data?.message || err?.error || 'Failed to submit review';
      toast.error(message);
    }
  };
  return (
    <div className="w-full bg-primary/25  rounded-xl p-6 2xl:p-10">
      <div className="text-4xl flex justify-center  py-4 text-primary">
        <RatingComponent
          emptySymbol={<Star />}
          fullSymbol={<Stars className="text-red-500 fill-red-500" />}
          initialRating={rating}
          onClick={(rate: number) => setRating(rate)}
        />
      </div>

      <div className="w-full md:p-10">
        <CRForm onSubmit={handleReviewSubmit}>
          <div className="flex gap-4 ">
            <CRInput
              type="text"
              className="w-full"
              readonly
              defaultValue={userData?.data?.name}
              name={'name'}
            />
            <CRInput
              type="text"
              className="w-full"
              readonly
              defaultValue={userData?.data?.email}
              name={'email'}
            />
          </div>
          <CRInput
            type="text"
            className="w-full"
            placeholder="profile image url"
            name={'profileImg'}
          />
          <CRTextarea type="text" name="feedback" />
          <CARButton htmlType="submit" text="Give your feedback" />
        </CRForm>
      </div>
    </div>
  );
};

export default ReviewForm;
