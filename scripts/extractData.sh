
#!/bin/bash

# Performs a dump of target database and compresses result.
# Outputs to: $DATASETS_DIR/$DUMPNAME.tar.xz

# Note: Absolute paths are required for use in cron jobs

DBNAME=stream_particles
ROOTDIR=~
DATASETS_DIR=$ROOTDIR/datasets
MEDIAS_DIR=$ROOTDIR/Documents/SBoccacci/Dev/elrond/streamParticles/medias
LOGDIR=$ROOTDIR/log
TAR=`which tar`

set -o nounset
set -o errexit

mkdir -p $DATASETS_DIR
mkdir -p $LOGDIR

LOGFILE=$LOGDIR/nightly-dump.log
DATE=$(date +"%Y%m%d%H%M")

DATASET_DIR=$DATASETS_DIR/$DATE
# ------------------------------------------------------------------------ DUMP

ARCHIVE_NAME=dataset-$DBNAME-$DATE

echo `date '+%Y-%m-%d %H:%M:%S'` Dumping database >> $LOGFILE

pwd

# Create raw dump
mongodump --db $DBNAME --out $DATASET_DIR/dump >> $LOGFILE

# Copy medias folder
cp -r ${MEDIAS_DIR} ${DATASET_DIR}

# Archive dump
$TAR -cvJf $DATASET_DIR/$ARCHIVE_NAME.tar.xz -C $DATASET_DIR . 2>> $LOGFILE


# Clean up working folder
rm -r $DATASET_DIR/dump
rm -r $DATASET_DIR/medias

echo "${DATE} Dump complete: $ARCHIVE_NAME.tar.xz" >> $LOGFILE
echo "" >> $LOGFILE

# Echo again so will show up in cronjob email
echo "${DATE} Dump complete: $ARCHIVE_NAME.tar.xz" 