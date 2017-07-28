/**
 * Users table
 */
{
    id,
    name,
    email,
    password,
    status, // active, inactive or deleted
    emailNotif, // enable/disable
    pushNotif, // disable/morning/night/day
    joinedOn,
    deleteOn // can be null
}

/**
 * Reset Code Table
 */
{
    id,
    userId, // FK
    code,
    sentOn
}

/**
 * Stories Table
 */
{
    id,
    title,
    slug,
    by,
    status, // active/deleted
    publishedOn, // can be null
    createdOn,
    cardCount // skeptical about this column
}

/**
 * Stories Read By Users Table.
 * Total number of views will be calculated from this table.
 */
{
    id,
    storyId,
    userId
}

/**
 * Cards Table
 */
{
    id,
    storyId, // 
    order, // not unique
    cardData,
    status, // active/deleted
    cardType, // image/video
    link, // can be null
    linkType // video/basic
}

/**
 * Favourite Card Table
 */
{
    id,
    cardId,
    userId,
    favouritedOn
}

/**
 * How to implement the preview feature?
 */