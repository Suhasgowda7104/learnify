export default (sequelize, DataTypes) => {
    const CourseContent = sequelize.define("CourseContent", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        courseId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'course_id',
            references: {
                model: 'courses',
                key: 'id'
            }
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        contentType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'content_type',
            validate: {
                isIn: {
                    args: [['pdf', 'text']],
                    msg: "Content type must be either 'pdf' or 'text'"
                }
            }
        },
        filePath: {
            type: DataTypes.STRING(500),
            allowNull: true,
            field: 'file_path',
            comment: 'stores path of uploaded file/doc'
        }
    }, {
        tableName: 'course_contents',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    CourseContent.associate = (models) => {
        CourseContent.belongsTo(models.Course, {
            foreignKey: "courseId",
            as: "course",
            onDelete: "CASCADE"
        });
    };

    return CourseContent;
};