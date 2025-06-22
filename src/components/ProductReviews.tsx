import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateProductReview,
  useHasPurchased,
  useProductReviews,
} from '@/services/productService'
import { useAuth } from '@/contexts/AuthContext'
import { Star } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

const reviewSchema = z.object({
  rating: z.string().nonempty('Rating is required'),
  comment: z
    .string()
    .nonempty('Comment is required')
    .min(10, 'Comment must be at least 10 characters'),
})

interface Review {
  _id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

interface ProductReviewsProps {
  productId: string
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: reviews = [], refetch } = useProductReviews(productId)
  const { data: purchaseStatus, isLoading: purchaseLoading } = useHasPurchased(
    productId,
    {
      enabled: !!user,
    }
  )
  const { mutate: createReview, isPending: isCreatingReview } =
    useCreateProductReview()

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: '', comment: '' },
  })

  const onSubmit = (data: z.infer<typeof reviewSchema>) => {
    createReview(
      {
        productId,
        reviewData: { rating: Number(data.rating), comment: data.comment },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Review Submitted!',
            description: 'Thank you for your feedback.',
          })
          queryClient.invalidateQueries({
            queryKey: ['productReviews', productId],
          })
          form.reset()
        },
        onError: (error: any) => {
          toast({
            title: 'Submission Failed',
            description:
              error.response?.data?.message ||
              'An error occurred. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>

      {/* Existing Reviews */}
      <div className="space-y-6 mb-8">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-700 pb-4">
              <div className="flex items-center mb-2">
                {renderStars(review.rating)}
                <p className="ml-4 font-semibold">{review.name}</p>
              </div>
              <p className="text-muted-foreground mb-1">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
              <p>{review.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      {/* Review Form */}
      {user && (
        <div className="p-6 border border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
          {purchaseLoading ? (
            <p>Checking your purchase history...</p>
          ) : purchaseStatus?.hasPurchased ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5">5 - Excellent</SelectItem>
                          <SelectItem value="4">4 - Good</SelectItem>
                          <SelectItem value="3">3 - Average</SelectItem>
                          <SelectItem value="2">2 - Fair</SelectItem>
                          <SelectItem value="1">1 - Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts on the product..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isCreatingReview}>
                  {isCreatingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </Form>
          ) : (
            <p className="text-yellow-400">
              You must purchase this product to leave a review.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductReviews
