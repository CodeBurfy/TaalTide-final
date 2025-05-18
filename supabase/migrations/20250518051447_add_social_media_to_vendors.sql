-- Add Instagram and Facebook fields to vendors table
ALTER TABLE vendors 
ADD COLUMN instagram_url TEXT,
ADD COLUMN facebook_url TEXT;

-- Update RLS policies to include new fields
-- (No policy changes needed as we're just adding optional fields)

-- Add comments for documentation
COMMENT ON COLUMN vendors.instagram_url IS 'Optional Instagram profile URL for the vendor';
COMMENT ON COLUMN vendors.facebook_url IS 'Optional Facebook page/group URL for the vendor';
